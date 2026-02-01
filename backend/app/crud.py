from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from app.schemas import UserCreate
from app.utils import hash_password, verify_password
from app.recsys.utils import generate_initial_taste_vector, get_text_embedding
import uuid

def create_user(db: Session, user: UserCreate):
    """Create a new user with hashed password"""
    vector = generate_initial_taste_vector(user.preferences)
    hashed_pw = hash_password(user.password)
    
    query = text("""
        INSERT INTO users (username, email, hashed_password, taste_vector)
        VALUES (:username, :email, :hashed_password, :taste_vector)
        RETURNING id, username, email, created_at
    """)
    
    result = db.execute(
        query,
        {
            "username": user.username,
            "email": user.email,
            "hashed_password": hashed_pw,
            "taste_vector": vector
        }
    )
    db.commit()
    return result.fetchone()

def get_user_by_credentials(db: Session, username: str, password: str):
    """Retrieve a user by username and password - returns user_id if valid, None otherwise"""
    query = text("""
        SELECT id, hashed_password FROM users WHERE username = :username
    """)
    
    result = db.execute(query, {"username": username}).fetchone()
    
    if result and verify_password(password, result.hashed_password):
        return str(result.id)
    return None

def get_all_users(db: Session, user_id: str = None):
    if user_id:
        # Get requesting user's taste vector
        user_vector_query = text("""
            SELECT taste_vector::text FROM users WHERE id = :user_id
        """)
        user_vector_result = db.execute(user_vector_query, {"user_id": user_id}).fetchone()
        
        if not user_vector_result or not user_vector_result[0]:
            # If user doesn't exist or has no taste vector, return all users without similarity
            query = text("""
                SELECT id::text as user_id, username, email, NULL as similarity FROM users WHERE id != :user_id
            """)
            results = db.execute(query, {"user_id": user_id})
            return [dict(row._mapping) for row in results]
        
        user_vector_str = user_vector_result[0]
        
        # Get all other users with similarity calculation using cosine similarity
        query = text("""
            SELECT 
                id::text as user_id,
                username, 
                email,
                CASE 
                    WHEN taste_vector IS NOT NULL THEN 
                        ROUND(CAST((1 - (taste_vector <=> CAST(:user_vector AS vector))) * 100 AS numeric), 2)
                    ELSE NULL 
                END as similarity
            FROM users 
            WHERE id != :user_id
            ORDER BY similarity DESC NULLS LAST
        """)
        results = db.execute(query, {"user_id": user_id, "user_vector": user_vector_str})
    else:
        # No user_id provided, return all users without similarity
        query = text("""
            SELECT id::text as user_id, username, email, NULL as similarity FROM users
        """)
        results = db.execute(query)
    
    return [dict(row._mapping) for row in results]

def get_recommmendations_for_user(db: Session, user_id: str, limit: int = 10):

    user_query = text("""
        SELECT taste_vector::text
                      from users
                      where id= :user_id
    """)

    user_result = db.execute(user_query, {"user_id": user_id}).fetchone()

    if not user_result or not user_result[0]:
        return []
    
    # pgvector returns the vector as a string like '[1.0,2.0,3.0]'
    # We can use it directly
    vector_str = user_result[0]

    recommendation_query = text("""
        SELECT p.id, p.title, p.artist, p.image_url, p.style, p.description,
               CASE WHEN w.user_id IS NOT NULL THEN true ELSE false END as is_wishlisted
        FROM paintings p
        LEFT JOIN wishlists w ON p.id = w.painting_id AND w.user_id = :user_id
        ORDER BY p.embedding <=> CAST(:vector_str AS vector)
        LIMIT :limit
    """)
    
    results = db.execute(
        recommendation_query,
        {"vector_str": vector_str, "limit": limit, "user_id": user_id}
    )

    return [dict(row._mapping) for row in results]

def search_paintings_by_description(db: Session, search_query: str, user_id: str = None, limit: int = 10):
    query_vector = get_text_embedding(search_query)
    
    # Flatten vector if it's nested and convert to list
    if hasattr(query_vector, 'tolist'):
        # If it's a numpy array
        query_vector = query_vector.tolist()
    
    # Ensure it's a flat list
    if isinstance(query_vector, list) and len(query_vector) > 0 and isinstance(query_vector[0], list):
        query_vector = query_vector[0]
    
    # Convert vector to string format for PostgreSQL
    vector_str = '[' + ','.join(map(str, query_vector)) + ']'
    
    if user_id:
        query = text("""
        SELECT p.id, p.title, p.artist, p.image_url, p.style, p.description,
               CASE WHEN w.user_id IS NOT NULL THEN true ELSE false END as is_wishlisted
        FROM paintings p
        LEFT JOIN wishlists w ON p.id = w.painting_id AND w.user_id = :user_id
        ORDER BY p.embedding <=> CAST(:vector_str AS vector)
        LIMIT :limit
        """)
        results = db.execute(
            query, 
            {"vector_str": vector_str, "limit": limit, "user_id": user_id}
        )
    else:
        query = text("""
        SELECT id, title, artist, image_url, style, description, false as is_wishlisted
        FROM paintings
        ORDER BY embedding <=> CAST(:vector_str AS vector)
        LIMIT :limit
        """)
        results = db.execute(
            query, 
            {"vector_str": vector_str, "limit": limit}
        )

    return [dict(row._mapping) for row in results]

def get_instant_blend_recommendations(db: Session, user_1_id: uuid.UUID, user_2_id: uuid.UUID, requesting_user_id: str = None, limit: int = 10):
    """Calculate blend of two users and return recommendations without saving to database"""
    query = text(
        """
        SELECT id, taste_vector::text FROM users WHERE id IN (:u1, :u2)
        """
    )
    users = db.execute(query, {"u1": user_1_id, "u2": user_2_id}).fetchall()
    if len(users) < 2:
        return None
    
    # Parse vector strings like '[1.0,2.0,3.0]' to lists of floats
    v1_str = users[0][1]  # taste_vector as text
    v2_str = users[1][1]
    
    # Remove brackets and split by comma, then convert to float
    v1 = [float(x) for x in v1_str.strip('[]').split(',')]
    v2 = [float(x) for x in v2_str.strip('[]').split(',')]

    # Calculate average of two vectors
    blend_vector = [(a + b)/2 for a, b in zip(v1, v2)]
    
    # Convert back to PostgreSQL vector format
    blend_vector_str = '[' + ','.join(map(str, blend_vector)) + ']'
    
    # Get paintings based on blend vector
    if requesting_user_id:
        paintings_query = text(
            """
            SELECT p.id, p.title, p.artist, p.image_url, p.style, p.description,
                   CASE WHEN w.user_id IS NOT NULL THEN true ELSE false END as is_wishlisted
            FROM paintings p
            LEFT JOIN wishlists w ON p.id = w.painting_id AND w.user_id = :user_id
            ORDER BY p.embedding <=> CAST(:vector_str AS vector)
            LIMIT :limit
        """
        )
        results = db.execute(
            paintings_query,
            {"vector_str": blend_vector_str, "limit": limit, "user_id": requesting_user_id}
        )
    else:
        paintings_query = text(
            """
            SELECT id, title, artist, image_url, style, description, false as is_wishlisted
            FROM paintings
            ORDER BY embedding <=> CAST(:vector_str AS vector)
            LIMIT :limit
        """
        )
        results = db.execute(
            paintings_query,
            {"vector_str": blend_vector_str, "limit": limit}
        )
    return [dict(row._mapping) for row in results]

def create_user_blend(db: Session, user_1_id: uuid.UUID, user_2_id: uuid.UUID):
    query = text(
        """
        SELECT id, taste_vector::text FROM users WHERE id IN (:u1, :u2)
        """
    )
    users = db.execute(query, {"u1": user_1_id, "u2": user_2_id}).fetchall()
    if len(users) < 2:
        return None
    
    # Parse vector strings like '[1.0,2.0,3.0]' to lists of floats
    v1_str = users[0][1]  # taste_vector as text
    v2_str = users[1][1]
    
    # Remove brackets and split by comma, then convert to float
    v1 = [float(x) for x in v1_str.strip('[]').split(',')]
    v2 = [float(x) for x in v2_str.strip('[]').split(',')]

    # Calculate average of two vectors
    blend_vector = [(a + b)/2 for a, b in zip(v1, v2)]
    
    # Convert back to PostgreSQL vector format
    blend_vector_str = '[' + ','.join(map(str, blend_vector)) + ']'
    
    query = text(
        """
        INSERT INTO blends(first_user, second_user, blend_vector)
        VALUES (:u1, :u2, CAST(:v AS vector))
        ON CONFLICT(first_user, second_user) DO UPDATE SET blend_vector = EXCLUDED.blend_vector
        RETURNING blend_id
    """
    )
    result = db.execute(
        query, 
        {"u1": user_1_id, "u2": user_2_id, "v": blend_vector_str}
    )
    db.commit()
    return result.fetchone()[0]

def get_blends(db: Session, user_id: uuid.UUID):
    query = text(
        """
        SELECT b.blend_id, u1.username as user_1_username, u2.username as user_2_username
        FROM blends b
        JOIN users u1 ON b.first_user = u1.id
        JOIN users u2 ON b.second_user = u2.id
        WHERE b.first_user = :uid OR b.second_user = :uid
    """
    )
    results = db.execute(query, {"uid": user_id})
    return [dict(row._mapping) for row in results]

def get_blend_recommendations(db: Session, blend_id: uuid.UUID, user_id: str = None, limit: int = 10):

    query = text(
        """
        SELECT blend_vector::text from blends where blend_id = :bid
    """
    )

    blend_result = db.execute(query, {"bid": blend_id}).fetchone()
    
    if not blend_result or not blend_result[0]:
        return []
    
    # Get the vector string directly
    vector_str = blend_result[0]
    
    if user_id:
        query = text(
            """
            SELECT p.id, p.title, p.artist, p.image_url, p.style, p.description,
                   CASE WHEN w.user_id IS NOT NULL THEN true ELSE false END as is_wishlisted
            FROM paintings p
            LEFT JOIN wishlists w ON p.id = w.painting_id AND w.user_id = :user_id
            ORDER BY p.embedding <=> CAST(:vector_str AS vector)
            LIMIT :limit
        """
        )
        results = db.execute(
            query,
            {"vector_str": vector_str, "limit": limit, "user_id": user_id}
        )
    else:
        query = text(
            """
            SELECT id, title, artist, image_url, style, description, false as is_wishlisted
            FROM paintings
            ORDER BY embedding <=> CAST(:vector_str AS vector)
            LIMIT :limit
        """
        )
        results = db.execute(
            query,
            {"vector_str": vector_str, "limit": limit}
        )
    return [dict(row._mapping) for row in results]

def toggle_wishlist(db: Session, user_id: str, painting_id: str):
    """Toggle a painting in user's wishlist - add if not present, remove if present"""
    # Check if painting is already in wishlist
    check_query = text("""
        SELECT 1 FROM wishlists
        WHERE user_id::text = :user_id AND painting_id::text = :painting_id
    """)
    
    exists = db.execute(check_query, {"user_id": user_id, "painting_id": painting_id}).fetchone()
    
    if exists:
        # Remove from wishlist
        delete_query = text("""
            DELETE FROM wishlists
            WHERE user_id::text = :user_id AND painting_id::text = :painting_id
        """)
        db.execute(delete_query, {"user_id": user_id, "painting_id": painting_id})
        db.commit()
        return False  # Now not in wishlist
    else:
        # Add to wishlist
        insert_query = text("""
            INSERT INTO wishlists (user_id, painting_id)
            VALUES (CAST(:user_id AS uuid), CAST(:painting_id AS uuid))
        """)
        db.execute(insert_query, {"user_id": user_id, "painting_id": painting_id})
        db.commit()
        return True  # Now in wishlist

def get_user_wishlist(db: Session, user_id: str):
    """Get all paintings in user's wishlist"""
    query = text("""
        SELECT p.id, p.title, p.artist, p.image_url, p.style, p.description, true as is_wishlisted
        FROM wishlists w
        JOIN paintings p ON w.painting_id = p.id
        WHERE w.user_id = :user_id
    """)
    
    results = db.execute(query, {"user_id": user_id})
    return [dict(row._mapping) for row in results]

def update_user_taste_profile(db: Session, user_id: str, preferences: List[str]):
    """Update user's taste vector based on new preferences"""
    # Check if user exists
    check_query = text("""
        SELECT id FROM users WHERE id = :user_id
    """)
    user_exists = db.execute(check_query, {"user_id": user_id}).fetchone()
    
    if not user_exists:
        return None
    
    # Generate new taste vector from preferences
    new_taste_vector = generate_initial_taste_vector(preferences)
    
    # Convert vector to PostgreSQL format
    vector_str = '[' + ','.join(map(str, new_taste_vector)) + ']'
    
    # Update the user's taste vector
    update_query = text("""
        UPDATE users
        SET taste_vector = CAST(:taste_vector AS vector)
        WHERE id = :user_id
        RETURNING id
    """)
    
    result = db.execute(
        update_query,
        {"user_id": user_id, "taste_vector": vector_str}
    )
    db.commit()
    
    return result.fetchone()  