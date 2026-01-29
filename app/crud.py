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

def get_eligible_users(db: Session):
    query = text( 
        """
        SELECT username, email FROM users
    """
    )
    results = db.execute(query)
    return [dict(row._mapping) for row in results]

def get_recommmendations_for_user(db: Session, user_id: str, limit: int = 10):

    user_query = text("""
        SELECT taste_vector
                      from users
                      where id= :user_id
    """)

    user_result = db.execute(user_query, {"user_id": user_id}).fetchone()

    if not user_result or not user_result[0]:
        return []
    
    user_vector = user_result.taste_vector

    recommendation_query = text("""
        SELECT id, title, artist, image_url, style
                                FROM paintings
                                ORDER BY embedding <=> :vector::vector
                                LIMIT :limit
                                """)
    
    results = db.execute(
        recommendation_query,
        {"vector": user_vector, "limit": limit}
    )

    return [dict(row._mapping) for row in results]

def search_paintings_by_description(db: Session, search_query: str, limit: int = 10):
    query_vector = get_text_embedding(search_query)
    query = text("""
    SELECT id, title, artist, image_url, style
                 FROM paintings
                 ORDER BY embedding <=> :vector::vector
                 LIMIT :limit
                 """)
    
    results = db.execute(
        query, 
        {"vector": query_vector, "limit": limit}
    )

    return [dict(row._mapping) for row in results]

def create_user_blend(db: Session, user_1_id: uuid.UUID, user_2_id: uuid.UUID):
    query = text(
        """
        SELECT id, taste_vector FROM users WHERE id IN (:u1, :u2)
        """
    )
    users = db.execute(query, {"u1": user_1_id, "u2": user_2_id}).fetchall()
    if len(users) < 2:
        return None
    
    v1 = users[0].taste_vector
    v2 = users[1].taste_vector

    blend_vector = [(a + b)/2 for a, b in zip(v1, v2)]
    query = text(
        """
        INSERT INTO blends(first_user, second_user, blend_vector)
        VALUES (:u1, :u2, :v::vector)
        ON CONFLICT(first_user, second_user) DO UPDATE SET blend_vector = EXCLUDED.blend_vector
        RETURNING blend_id
    """
    )
    result = db.execute(
        query, 
        {"u1": user_1_id, "u2": user_2_id, "v": blend_vector}
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

def get_blend_recommendations(db: Session, blend_id: uuid.UUID, limit: int = 10):

    query = text(
        """
        SELECT blend_vector from blends where blend_id = :bid
    """
    )

    blend_vector = db.execute(query, {"bid": blend_id}).fetchone()
    query = text(
        """
        SELECT id, title, artist, image_url, style
        FROM paintings
        ORDER BY embedding <=> :vector::vector
        LIMIT :limit
    """
    )
    results = db.execute(
        query,
        {"vector": blend_vector, "limit": limit}
    )
    return [dict(row._mapping) for row in results]

def add_to_wishlist(db: Session, user_id: str, painting_id: str):
    """Add a painting to user's wishlist"""
    query = text("""
        INSERT INTO wishlists (user_id, painting_id)
        VALUES (:user_id, :painting_id)
        ON CONFLICT DO NOTHING
    """)
    
    db.execute(query, {"user_id": user_id, "painting_id": painting_id})
    db.commit()
    return True

def get_user_wishlist(db: Session, user_id: str):
    """Get all paintings in user's wishlist"""
    query = text("""
        SELECT p.id, p.title, p.artist, p.image_url, p.style
        FROM wishlists w
        JOIN paintings p ON w.painting_id = p.id
        WHERE w.user_id = :user_id
    """)
    
    results = db.execute(query, {"user_id": user_id})
    return [dict(row._mapping) for row in results]  