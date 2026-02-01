"""
Script to populate the database with famous paintings and their embeddings.
Run this script to initialize the database with sample data.

Usage: python populate_paintings.py
"""

import sys
from sqlalchemy import text
from database import SessionLocal
from recsys.utils import get_text_embedding

# 100+ Famous paintings across different styles
PAINTINGS = [
    # Abstract
    {"title": "Composition VIII", "artist": "Wassily Kandinsky", "style": "abstract", "image_url": "    ", "description": "Vibrant abstract composition featuring geometric shapes including circles, triangles, and lines in bold primary colors of red, yellow, blue, and black against a light beige background with dynamic angular forms and intersecting planes"},
    {"title": "Broadway Boogie Woogie", "artist": "Piet Mondrian", "style": "abstract", "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/30/Piet_Mondrian%2C_1942_-_Broadway_Boogie_Woogie.jpg", "description": "Geometric grid pattern with bright yellow, red, and blue rectangular blocks creating a rhythmic visual pattern resembling city streets from above, featuring a white background with colorful squares arranged in a syncopated grid"},
    {"title": "No. 5, 1948", "artist": "Jackson Pollock", "style": "abstract", "image_url": "https://www.jackson-pollock.org/assets/img/paintings/number-5.jpg", "description": "Chaotic abstract expressionist drip painting with dense layers of brown, yellow, gray, and white paint splattered across the canvas creating an intricate web-like texture with no recognizable forms"},
    {"title": "Black Square", "artist": "Kazimir Malevich", "style": "abstract", "image_url": "https://d7hftxdivxxvm.cloudfront.net/?height=632&quality=80&resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FAVjxLlGSYPD9AAuno1tjmw%2Flarge.jpg&width=640", "description": "Minimalist suprematist painting featuring a solid black square centered on a white background representing pure geometric abstraction and the elimination of representational art"},
    {"title": "Suprematist Composition", "artist": "Kazimir Malevich", "style": "abstract", "image_url": "https://upload.wikimedia.org/wikipedia/commons/1/13/Suprematist_Composition_-_Kazimir_Malevich.jpg", "description": "Dynamic geometric composition with colored rectangles, squares, and diagonal lines in red, yellow, blue, black, and white floating against a pale background creating spatial tension"},
    {"title": "Improvisation 28", "artist": "Wassily Kandinsky", "style": "abstract", "image_url": "https://www.guggenheim.org/wp-content/uploads/1912/01/37.239_ph_web-1.jpg", "description": "Vibrant abstract landscape with swirling forms and bold colors including yellow, orange, blue, and black with hints of architectural and organic shapes dissolving into pure abstraction"},
    {"title": "Orange, Red, Yellow", "artist": "Mark Rothko", "style": "abstract", "image_url": "https://www.mark-rothko.org/assets/img/paintings/orange-red-yellow.jpg", "description": "Color field painting with horizontal bands of warm colors including orange, red, and yellow with soft blurred edges creating a meditative atmospheric effect and luminous quality"},
    {"title": "Woman I", "artist": "Willem de Kooning", "style": "abstract", "image_url": "https://upload.wikimedia.org/wikipedia/en/2/2a/Woman_I-Willem_de_Kooning.jpg", "description": "Abstract expressionist female figure with aggressive brushstrokes in flesh tones, yellows, and blues creating a distorted semi-abstract woman with exaggerated features and gestural energy"},
    {"title": "Blue Poles", "artist": "Jackson Pollock", "style": "abstract", "image_url": "https://upload.wikimedia.org/wikipedia/en/2/2d/Blue_Poles_%28Jackson_Pollock_painting%29.jpg", "description": "Large-scale abstract expressionist painting with chaotic drips and splatters in black, white, yellow, and orange with eight vertical blue poles cutting through the composition"},
    {"title": "Untitled (Yellow and Blue)", "artist": "Mark Rothko", "style": "abstract", "image_url": "https://sothebys-md.brightspotcdn.com/dims4/default/e7e1abd/2147483647/strip/true/crop/5474x7312+0+0/resize/4096x5471!/quality/90/?url=http%3A%2F%2Fsothebys-brightspot.s3.amazonaws.com%2Fmedia-desk%2F2a%2F9a%2F0227bc8f4c9aba8c16f27228c50d%2Fhk1552-86pcp-install-cover.jpg", "description": "Color field painting with large rectangular blocks of deep rust orange and dark blue stacked horizontally with soft diffused edges creating emotional depth and contemplative mood"},
    
    # Realism
    {"title": "The Gleaners", "artist": "Jean-François Millet", "style": "realism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg/1280px-Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project_2.jpg", "description": "Rural landscape scene depicting three peasant women bent over gathering leftover grain in a golden wheat field under a soft blue sky with warm earth tones and muted colors representing agricultural labor"},
    {"title": "The Stone Breakers", "artist": "Gustave Courbet", "style": "realism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Gustave_Courbet_-_The_Stonebreakers_-_WGA05457.jpg/1280px-Gustave_Courbet_-_The_Stonebreakers_-_WGA05457.jpg", "description": "Somber outdoor scene showing two manual laborers breaking stones on a roadside with brown, gray, and earth tones portraying working-class hardship in a naturalistic style"},
    {"title": "The Gross Clinic", "artist": "Thomas Eakins", "style": "realism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/4/41/Thomas_Eakins%2C_American_-_Portrait_of_Dr._Samuel_D._Gross_%28The_Gross_Clinic%29_-_Google_Art_Project.jpg", "description": "Dramatic medical theater interior with surgeons performing an operation under bright light, featuring dark browns and blacks with dramatic chiaroscuro highlighting the clinical procedure and observing students"},
    {"title": "Barge Haulers on the Volga", "artist": "Ilya Repin", "style": "realism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Ilia_Efimovich_Repin_%281844-1930%29_-_Volga_Boatmen_%281870-1873%29.jpg/1280px-Ilia_Efimovich_Repin_%281844-1930%29_-_Volga_Boatmen_%281870-1873%29.jpg", "description": "River landscape showing eleven laborers straining to pull a barge along the sandy shore under a pale blue sky, painted in naturalistic browns, grays, and blues depicting harsh physical labor"},
    {"title": "A Burial At Ornans", "artist": "Gustave Courbet", "style": "realism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIr8ajcpj1dbN6PkNpFK8a68BF5UPA6JucCw&s", "description": "Large-scale funeral scene with dozens of mourners dressed in black surrounding an open grave under an overcast sky, painted in somber dark tones depicting a provincial burial ceremony"},
    {"title": "The Horse Fair", "artist": "Rosa Bonheur", "style": "realism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Rosa_Bonheur%2C_The_Horse_Fair%2C_1852%E2%80%9355.jpg/1280px-Rosa_Bonheur%2C_The_Horse_Fair%2C_1852%E2%80%9355.jpg", "description": "Dynamic outdoor scene of powerful horses being paraded and traded at a market with handlers, featuring rich browns, grays, and natural colors with detailed anatomical rendering"},
    {"title": "The Third-Class Carriage", "artist": "Honoré Daumier", "style": "realism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC9YBWj2N3zhcR9fcF7IVBs2lYMaN56p-uPA&s", "description": "Interior of a crowded train carriage with working-class passengers including a nursing mother, painted in dark browns and muted tones capturing the cramped conditions of lower-class travel"},
    {"title": "The Agnew Clinic", "artist": "Thomas Eakins", "style": "realism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/2/21/The_Agnew_Clinic_-_Thomas_Eakins.jpg", "description": "Bright medical amphitheater scene showing a surgical demonstration with doctors in white coats and observing students, painted in realistic detail with clinical whites and flesh tones"},
    {"title": "Nighthawks", "artist": "Edward Hopper", "style": "realism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1280px-Nighthawks_by_Edward_Hopper_1942.jpg", "description": "Urban night scene of an illuminated corner diner with isolated customers visible through large windows, featuring stark contrasts between warm yellow interior light and cool dark blue night exterior"},
    {"title": "Christina's World", "artist": "Andrew Wyeth", "style": "realism", "image_url": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Christinasworld.jpg/395px-Christinasworld.jpg", "description": "Rural landscape with a woman in a pink dress crawling through a vast dry grass field toward distant farm buildings under a pale sky, painted in muted pinks, browns, and grays"},
    
    # Impressionism
    {"title": "Impression, Sunrise", "artist": "Claude Monet", "style": "impressionism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/5/59/Monet_-_Impression%2C_Sunrise.jpg", "description": "Harbor seascape at dawn with small boats silhouetted against orange sun reflecting on water, painted with loose brushstrokes in blue, orange, and gray tones capturing atmospheric light effects"},
    {"title": "Water Lilies", "artist": "Claude Monet", "style": "impressionism", "image_url": "https://www.sireseyewear.com/cdn/shop/articles/Water_Lilies_1916_-_1919_-_Claude_Monet.webp?crop=center&height=1200&v=1722913097&width=1200", "description": "Tranquil pond surface covered with pink and white water lilies floating among green lily pads with reflections of sky and foliage, painted with soft impressionistic brushwork in blues, greens, and pinks"},
    {"title": "The Starry Night", "artist": "Vincent van Gogh", "style": "impressionism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg", "description": "Night sky landscape with swirling stars and crescent moon above a village with dark cypress tree in foreground, painted in bold blues, yellows, and swirling patterns with expressive brushstrokes"},
    {"title": "A Sunday on La Grande Jatte", "artist": "Georges Seurat", "style": "impressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlpkIySynpJlZwbAwugEJCJDRMMgsusuAD-Q&s", "description": "Park landscape with elegantly dressed people relaxing by a river on a sunny day, painted with pointillist technique using small dots of color in greens, blues, and warm tones"},
    {"title": "Dance at Le Moulin de la Galette", "artist": "Pierre-Auguste Renoir", "style": "impressionism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/4/40/Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Mus%C3%A9e_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg", "description": "Lively outdoor dance scene with couples dancing and socializing under dappled sunlight filtering through trees, painted with warm colors and soft brushwork capturing joyful atmosphere"},
    {"title": "The Luncheon of the Boating Party", "artist": "Pierre-Auguste Renoir", "style": "impressionism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/8/8d/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg", "description": "Festive outdoor terrace scene with people dining and socializing after boating, featuring bright sunlight, colorful clothing, and warm social atmosphere painted with impressionistic light effects"},
    {"title": "Woman with a Parasol", "artist": "Claude Monet", "style": "impressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ5KsP3iiXAmDWaSmJ-V5vPSyeJ8jQRmEN4w&s", "description": "Outdoor portrait of woman in white dress holding parasol standing on grassy hillside against cloudy blue sky, painted with loose brushstrokes capturing wind movement and natural light"},
    {"title": "The Absinthe Drinker", "artist": "Edgar Degas", "style": "impressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJS4mCZ2GwTL6MwDWvMmGczDUzErH4ihX0gA&s", "description": "Melancholic café interior showing isolated figures at a table with a glass of absinthe, painted in muted browns, greens, and yellows depicting urban alienation"},
    {"title": "Sunflowers", "artist": "Vincent van Gogh", "style": "impressionism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/4/46/Vincent_Willem_van_Gogh_127.jpg", "description": "Still life of vibrant yellow sunflowers in a vase against yellow background, painted with thick impasto brushstrokes and intense golden yellows with brown centers"},
    {"title": "Café Terrace at Night", "artist": "Vincent van Gogh", "style": "impressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyXHh--wSkLMHAUCgUrm-LZlMDmfQUQ6Ipdw&s", "description": "Nighttime urban scene of outdoor café with yellow-lit terrace and diners under awning beside cobblestone street under deep blue starry sky with expressive brushwork"},
    
    # Cubism
    {"title": "Les Demoiselles d'Avignon", "artist": "Pablo Picasso", "style": "cubism", "image_url": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Les_Demoiselles_d%27Avignon.jpg/1280px-Les_Demoiselles_d%27Avignon.jpg", "description": "Fragmented angular female figures with geometric faces showing multiple viewpoints simultaneously, painted in warm flesh tones, browns, and pinks with African mask influences"},
    {"title": "Guernica", "artist": "Pablo Picasso", "style": "cubism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkoqJBNjNqgPoQPeyGj8lwRSk-AH7qzIqaWw&s", "description": "Large monochromatic mural depicting war devastation with fragmented figures including screaming horse, bull, and human forms in anguished poses, painted in black, white, and gray tones"},
    {"title": "The Weeping Woman", "artist": "Pablo Picasso", "style": "cubism", "image_url": "https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Picasso_The_Weeping_Woman_Tate_identifier_T05010_10.jpg/250px-Picasso_The_Weeping_Woman_Tate_identifier_T05010_10.jpg", "description": "Portrait of distressed woman crying with fractured face showing multiple angles simultaneously, painted in vivid colors including yellows, greens, reds, and blues with angular sharp forms"},
    {"title": "Violin and Candlestick", "artist": "Georges Braque", "style": "cubism", "image_url": "https://upload.wikimedia.org/wikipedia/en/3/3c/Violin_and_Candlestick.jpg", "description": "Fragmented still life with musical instrument deconstructed into geometric planes and multiple perspectives, painted in muted browns, tans, and grays in analytical cubist style"},
    {"title": "Three Musicians", "artist": "Pablo Picasso", "style": "cubism", "image_url": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Picasso_three_musicians_moma_2006.jpg/330px-Picasso_three_musicians_moma_2006.jpg", "description": "Flat geometric figures of three musicians with instruments arranged in overlapping colorful shapes in browns, whites, blacks, yellows, and blues in synthetic cubist collage-like style"},
    {"title": "Girl with a Mandolin", "artist": "Pablo Picasso", "style": "cubism", "image_url": "https://upload.wikimedia.org/wikipedia/en/1/1c/Pablo_Picasso%2C_1910%2C_Girl_with_a_Mandolin_%28Fanny_Tellier%29%2C_oil_on_canvas%2C_100.3_x_73.6_cm%2C_Museum_of_Modern_Art_New_York..jpg", "description": "Female figure with musical instrument fragmented into geometric planes showing multiple viewpoints, painted in subdued ochres, browns, and grays in analytical cubist approach"},
    {"title": "Houses at L'Estaque", "artist": "Georges Braque", "style": "cubism", "image_url": "https://upload.wikimedia.org/wikipedia/en/a/ad/Georges_Braque%2C_1908%2C_Maisons_et_arbre%2C_oil_on_canvas%2C_40.5_x_32.5_cm%2C_Lille_M%C3%A9tropole_Museum_of_Modern%2C_Contemporary_and_Outsider_Art.jpg", "description": "Mediterranean landscape with cubic simplified houses and trees reduced to geometric forms, painted in earth tones of ochre, green, and brown showing early cubist style"},
    {"title": "Portrait of Ambroise Vollard", "artist": "Pablo Picasso", "style": "cubism", "image_url": "https://upload.wikimedia.org/wikipedia/en/4/4c/Portrait_of_Ambroise_Vollard_by_Picasso.jpg", "description": "Fragmented portrait with face and body dissolved into intersecting geometric planes from multiple angles, painted in monochromatic browns and grays in analytical cubist technique"},
    {"title": "Man with a Guitar", "artist": "Georges Braque", "style": "cubism", "image_url": "https://www.moma.org/media/W1siZiIsIjQzODQ0NiJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=28957f3cf7637cd1", "description": "Abstract figure with guitar broken into overlapping faceted planes and geometric shapes, painted in muted tans, browns, and grays showing analytical cubism's fragmentation"},
    {"title": "The Portuguese", "artist": "Georges Braque", "style": "cubism", "image_url": "https://uploads1.wikiart.org/images/georges-braque/portuguese-1911.jpg!Large.jpg", "description": "Musician figure fragmented into geometric shards with stenciled letters and numbers, painted in browns and grays combining analytical cubism with collage elements"},
    
    # Surrealism
    {"title": "The Persistence of Memory", "artist": "Salvador Dalí", "style": "surrealism", "image_url": "https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg", "description": "Dreamlike barren landscape with melting pocket watches draped over tree branch and abstract form under golden-orange cliffs by the sea, painted in realistic detail with surreal subject matter"},
    {"title": "The Son of Man", "artist": "René Magritte", "style": "surrealism", "image_url": "https://upload.wikimedia.org/wikipedia/en/e/e5/Magritte_TheSonOfMan.jpg", "description": "Man in black suit and bowler hat with face obscured by floating green apple against seaside background, painted in realistic style with mysterious surreal juxtaposition"},
    {"title": "The Treachery of Images", "artist": "René Magritte", "style": "surrealism", "image_url": "https://upload.wikimedia.org/wikipedia/en/b/b9/MagrittePipe.jpg", "description": "Realistic painting of smoking pipe on plain background with text stating this is not a pipe, featuring browns and beiges questioning representation and reality"},
    {"title": "The Elephants", "artist": "Salvador Dalí", "style": "surrealism", "image_url": "https://upload.wikimedia.org/wikipedia/en/4/43/Dali_Elephants.jpg", "description": "Surreal scene with elephants on impossibly long spindly legs walking through desert landscape, painted with meticulous realism in earth tones and blues creating dreamlike atmosphere"},
    {"title": "The Burning Giraffe", "artist": "Salvador Dalí", "style": "surrealism", "image_url": "https://upload.wikimedia.org/wikipedia/en/e/e6/The_Burning_Giraffe.jpg", "description": "Nightmarish desert scene with distorted female figures supported by crutches and burning giraffe in background, painted in vivid reds, oranges, blues, and flesh tones with symbolic imagery"},
    {"title": "Swans Reflecting Elephants", "artist": "Salvador Dalí", "style": "surrealism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzsxUvC-Yxs1DYL9Vpet1LJDfloZSgFS5Jng&s", "description": "Lake landscape where swan reflections transform into elephants through double-image technique, painted with realistic detail in natural colors creating optical illusion"},
    {"title": "The False Mirror", "artist": "René Magritte", "style": "surrealism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTis47YoAgvtQ02FmHxBrqI0JU0R8WfXllIBw&s", "description": "Giant human eye with blue sky and white clouds reflected in iris and black pupil center, painted realistically exploring themes of perception and reality"},
    {"title": "The Lovers", "artist": "René Magritte", "style": "surrealism", "image_url": "https://www.moma.org/media/W1siZiIsIjIxNTkyMSJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=8e30b17830fee6ac", "description": "Two figures kissing with heads covered in white cloth obscuring faces, painted in muted colors exploring themes of hidden identity and blind love"},
    {"title": "Time Transfixed", "artist": "René Magritte", "style": "surrealism", "image_url": "https://upload.wikimedia.org/wikipedia/en/b/b0/Time_transfixed.jpg", "description": "Domestic interior with miniature steam locomotive emerging from fireplace with realistic detail, painted in browns, blacks, and warm tones creating impossible juxtaposition"},
    {"title": "The Metamorphosis of Narcissus", "artist": "Salvador Dalí", "style": "surrealism", "image_url": "https://upload.wikimedia.org/wikipedia/en/2/21/Metamorphosis_of_Narcissus.jpg", "description": "Mythological landscape with figure transforming into hand holding egg, painted in yellows, blues, and earth tones with precise double-image technique and symbolic metamorphosis"},
    
    # Renaissance
    {"title": "Mona Lisa", "artist": "Leonardo da Vinci", "style": "renaissance", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5RWspPqQt_gqeDJHtk0sqlR1DxvWYrH1cPA&s", "description": "Portrait of woman with enigmatic smile seated against distant landscape background, painted with sfumato technique in warm browns, greens, and muted colors with atmospheric perspective"},
    {"title": "The Last Supper", "artist": "Leonardo da Vinci", "style": "renaissance", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpiWdvq-aV19PZ9F1Ov0U7GYK4NYAEOd8SA&s", "description": "Biblical interior scene showing Jesus and twelve apostles at long table during last supper, painted with linear perspective in earth tones, reds, and blues with architectural setting"},
    {"title": "The Creation of Adam", "artist": "Michelangelo", "style": "renaissance", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg", "description": "Fresco showing God reaching out to touch Adam's finger against blue sky, painted with muscular idealized figures in flesh tones, blues, and warm colors depicting moment of creation"},
    {"title": "The Birth of Venus", "artist": "Sandro Botticelli", "style": "renaissance", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTO2JcjZBE8HuVwCw292tGyULxWI8rvYy2IYw&s", "description": "Mythological seascape with nude Venus standing on shell blown by wind gods toward shore with nymph offering cloak, painted in soft pastels, pinks, blues, and golds with flowing linear grace"},
    {"title": "The School of Athens", "artist": "Raphael", "style": "renaissance", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH7l8eWLDhE46jpomew5AzPWE9TFnfr1HiYQ&s", "description": "Grand architectural interior with ancient philosophers gathered in classical building with arches, painted with perfect perspective in warm earth tones, reds, blues, and golds depicting intellectual gathering"},
    {"title": "Primavera", "artist": "Sandro Botticelli", "style": "renaissance", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTroQGGbGo2D42ucAiY_GartC6Jz65TYo46pA&s", "description": "Mythological garden scene with Venus, Mercury, and Three Graces among orange trees and flowers, painted in delicate colors with flowing drapery and decorative botanical details depicting spring"},
    {"title": "The Sistine Madonna", "artist": "Raphael", "style": "renaissance", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSboaFDASJdL56nxFo22zRySAPm4UsJjKgDkg&s", "description": "Religious scene of Madonna holding infant Jesus floating on clouds with cherubs below, painted in rich reds, blues, and golds with idealized figures and serene composition"},
    {"title": "David", "artist": "Michelangelo", "style": "renaissance", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/%27David%27_by_Michelangelo_Fir_JBU004.jpg/500px-%27David%27_by_Michelangelo_Fir_JBU004.jpg", "description": "Marble sculpture of nude male biblical hero in contrapposto pose showing idealized muscular anatomy, carved from white stone with classical proportions and naturalistic details"},
    {"title": "Vitruvian Man", "artist": "Leonardo da Vinci", "style": "renaissance", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6WDmVQu2O0fYQ4PZYC0eXzMHUHR2cxVhmCw&s", "description": "Anatomical drawing of nude male figure with arms and legs extended in two positions inscribed in circle and square, rendered in ink on aged paper showing mathematical proportions"},
    {"title": "The Arnolfini Portrait", "artist": "Jan van Eyck", "style": "renaissance", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/The_Arnolfini_portrait_%281434%29.jpg/960px-The_Arnolfini_portrait_%281434%29.jpg", "description": "Domestic interior portrait of wealthy couple in elaborate clothing with dog, painted with meticulous detail in rich greens, browns, and reds using oil technique with symbolic objects"},
    
    # Baroque
    {"title": "The Night Watch", "artist": "Rembrandt", "style": "baroque", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/La_ronda_de_noche%2C_por_Rembrandt_van_Rijn.jpg/500px-La_ronda_de_noche%2C_por_Rembrandt_van_Rijn.jpg", "description": "Group portrait of militia company in dramatic lighting with captain in black and lieutenant in yellow prominent in center, painted with dynamic composition in rich browns, golds, and reds with chiaroscuro"},
    {"title": "Girl with a Pearl Earring", "artist": "Johannes Vermeer", "style": "baroque", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg2T_bevk01lC-70mdIAseWPMDur5SMXAWEQ&s", "description": "Portrait of young woman turning to viewer wearing exotic turban and large pearl earring against dark background, painted with soft lighting in blues, yellows, and flesh tones"},
    {"title": "The Calling of Saint Matthew", "artist": "Caravaggio", "style": "baroque", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt9moy3R9vuEZHvQqMLihCt-yobIOloTxi8A&s", "description": "Biblical interior scene with Christ pointing at tax collector Matthew at table illuminated by dramatic shaft of light, painted with tenebrism in dark browns with bright highlights"},
    {"title": "Las Meninas", "artist": "Diego Velázquez", "style": "baroque", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReMIWdajTf-1maSWQtgmxa8nltmwuSKuNTGA&s", "description": "Complex palace interior with young princess surrounded by attendants and artist at easel with mirror reflection of royal couple, painted with spatial depth in grays, pinks, reds, and whites"},
    {"title": "The Anatomy Lesson of Dr. Nicolaes Tulp", "artist": "Rembrandt", "style": "baroque", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQd82VZrdsrDtO4dPXnS24q2f6vS59_WF3sbw&s", "description": "Medical demonstration scene with doctor showing arm anatomy to group of observers around corpse, painted with dramatic lighting in blacks, whites, and flesh tones with precise detail"},
    {"title": "The Milkmaid", "artist": "Johannes Vermeer", "style": "baroque", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMcVo1wGAsSWdr5ENvQaEut7SWnz1dpR443Q&s", "description": "Domestic interior with servant pouring milk from pitcher in soft daylight, painted with meticulous detail in blues, yellows, and warm earth tones with luminous quality"},
    {"title": "Judith Slaying Holofernes", "artist": "Artemisia Gentileschi", "style": "baroque", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjSt-G8WUpjcW8mqKiW_I0ple2wDHfn7_pHA&s", "description": "Violent biblical scene with woman beheading general assisted by servant, painted with dramatic action and strong chiaroscuro in reds, golds, and dark shadows showing intense emotion"},
    {"title": "The Cardsharps", "artist": "Caravaggio", "style": "baroque", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIP-ZqgtY7wxawUkCincajwGJ4a0YeaTqI3A&s", "description": "Genre scene of card players cheating young nobleman with dramatic lighting revealing deception, painted in earth tones with strong light-dark contrasts and psychological tension"},
    {"title": "View of Delft", "artist": "Johannes Vermeer", "style": "baroque", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXh0qSto1FPbJu4iILsvBPUMpQqBnJ0Bagfg&s", "description": "Cityscape showing town reflected in canal under cloudy sky with dramatic light effects, painted with precise architectural detail in blues, grays, reds, and yellows with atmospheric perspective"},
    {"title": "The Storm on the Sea of Galilee", "artist": "Rembrandt", "style": "baroque", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo-F0xj-ztngl8jK9pEncsKGdyo_fIKVm8iA&s", "description": "Dramatic seascape with boat full of disciples struggling in violent storm with tilted mast and churning waves, painted with dynamic diagonals in dark greens, browns, and dramatic highlights"},
    
    # Romanticism
    {"title": "The Third of May 1808", "artist": "Francisco Goya", "style": "romanticism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1SYqNBHQfCDqle_5VlBMH0HrYMqywYmgqzA&s", "description": "Dramatic night scene of Spanish civilians being executed by firing squad with central figure in white shirt with arms raised, painted with emotional intensity in dark browns, blacks, reds, and stark white highlighting tragedy"},
    {"title": "Liberty Leading the People", "artist": "Eugène Delacroix", "style": "romanticism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu9Dbhvc_nGxclBZCRRMfZbXEJntcUZb_mww&s", "description": "Revolutionary scene with allegorical woman holding tricolor flag leading armed citizens over barricade with smoke and bodies, painted with dramatic action in reds, blues, and yellows with emotional heroism"},
    {"title": "The Raft of the Medusa", "artist": "Théodore Géricault", "style": "romanticism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGKKFIrdufrg1gF7WvCz03BfOTrDXmImY6Ew&s", "description": "Dramatic seascape with shipwreck survivors on makeshift raft waving at distant ship under stormy sky, painted with powerful muscular figures in browns, grays, and flesh tones showing human suffering"},
    {"title": "Wanderer above the Sea of Fog", "artist": "Caspar David Friedrich", "style": "romanticism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSunqVvhYnE8je3RN7W5Klbifs9Kr_NnfFDpw&s", "description": "Solitary man in dark coat standing on rocky peak gazing at mountain landscape shrouded in mist, painted with atmospheric blues, grays, and greens evoking sublime contemplation of nature"},
    {"title": "The Hay Wain", "artist": "John Constable", "style": "romanticism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3xqvfi_wvGcOi3TDY5XoI0CSalhQm02REjA&s", "description": "Idyllic rural landscape with horse-drawn cart crossing stream near cottage under cloudy sky, painted with naturalistic greens, blues, and earth tones celebrating pastoral English countryside"},
    {"title": "Saturn Devouring His Son", "artist": "Francisco Goya", "style": "romanticism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqTxiE8HlLA1d7H-17WRzxj7Sx-SJRdnKeqQ&s", "description": "Horrific mythological scene of giant figure consuming human body against black background, painted with nightmarish intensity in dark browns, reds, and flesh tones depicting primal violence"},
    {"title": "The Fighting Temeraire", "artist": "J.M.W. Turner", "style": "romanticism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP-KsuLhZVmV4gdU64oqBLNgUJ-MgrqPROBg&s", "description": "Maritime sunset scene with old warship being towed by steamboat under glowing sky with dramatic clouds, painted with luminous oranges, yellows, blues, and atmospheric light effects"},
    {"title": "The Death of Sardanapalus", "artist": "Eugène Delacroix", "style": "romanticism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgNFfyRSuwDs5v_f3fbAN6X9JpplkbFxKOtg&s", "description": "Chaotic scene of oriental king watching destruction of possessions and concubines from bed, painted with violent movement and rich reds, golds, flesh tones, and dramatic lighting showing decadent tragedy"},
    {"title": "The Nightmare", "artist": "Henry Fuseli", "style": "romanticism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuEhAp8JN3a-pnHVczPJ2KEcQVgxDW9bXZbA&s", "description": "Supernatural bedroom scene with sleeping woman in white draped across bed with demon sitting on chest and ghostly horse emerging from darkness, painted in dramatic reds, whites, and blacks evoking gothic horror"},
    {"title": "The Oxbow", "artist": "Thomas Cole", "style": "romanticism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Cole_Thomas_The_Oxbow_%28The_Connecticut_River_near_Northampton_1836%29.jpg/1280px-Cole_Thomas_The_Oxbow_%28The_Connecticut_River_near_Northampton_1836%29.jpg", "description": "Panoramic landscape showing contrast between wild storm on left and pastoral cultivated valley on right with river bend, painted in greens, blues, and warm tones depicting American wilderness"},
    
    # Expressionism
    {"title": "The Scream", "artist": "Edvard Munch", "style": "expressionism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/1280px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg", "description": "Anguished figure with hands to face on bridge under swirling red-orange sky with undulating landscape, painted with distorted forms in vivid reds, oranges, yellows, and blues expressing existential anxiety"},
    {"title": "The Kiss", "artist": "Gustav Klimt", "style": "expressionism", "image_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/330px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg", "description": "Embracing couple wrapped in elaborate golden robes decorated with geometric patterns against flower meadow, painted with gold leaf and rich colors including yellows, golds, greens, and ornamental details"},
    {"title": "Portrait of Adele Bloch-Bauer I", "artist": "Gustav Klimt", "style": "expressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrxCy676OckAlE-Th2DJl1wqYZb4bmAX5XRg&s", "description": "Portrait of elegant woman in elaborate golden dress with geometric and spiral patterns against decorative background, painted with gold leaf, yellows, and browns with Byzantine-inspired ornamentation"},
    {"title": "The Madonna", "artist": "Edvard Munch", "style": "expressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnLHker2y48J7CwrTcf3fkh3CXFS_pF8OvJQ&s", "description": "Sensual nude woman with flowing dark hair and closed eyes against red background with halo effect, painted with expressive brushwork in flesh tones, reds, and blacks evoking spiritual and erotic themes"},
    {"title": "The Dance of Life", "artist": "Edvard Munch", "style": "expressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzv3qNahJchnbn3lZPgpAMMwZuYG8PhzDzBA&s", "description": "Beach scene with dancing couples including woman in white, red, and black dresses representing life stages, painted with flowing forms in reds, whites, blacks, and blues depicting human relationships"},
    {"title": "Street, Berlin", "artist": "Ernst Ludwig Kirchner", "style": "expressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQa8tzNpvl4I_ZbMpukpuh8PJkxCWHqF-joNw&s", "description": "Urban street scene with elongated fashionable women and men in angular distorted forms, painted with sharp colors including pinks, greens, blues, and blacks showing modern city alienation"},
    {"title": "Self-Portrait with Chinese Lantern Plant", "artist": "Egon Schiele", "style": "expressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShaf1_788TnAOWYyU8aWdf376zPGBj8cymZQ&s", "description": "Intense self-portrait with gaunt angular face and twisted pose holding orange plant against dark background, painted with harsh contours in browns, oranges, and flesh tones with psychological intensity"},
    {"title": "The Blue Rider", "artist": "Wassily Kandinsky", "style": "expressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsm0OQnIVCenYsaU2BvF7_LH-pT-2MeGmLxg&s", "description": "Rider on blue horse galloping through landscape with simplified forms, painted with bold blues, greens, and whites with expressive brushwork showing movement toward abstraction"},
    {"title": "Large Blue Horses", "artist": "Franz Marc", "style": "expressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDBF889wbxDq6zfQLoD2AiXJGuojwNRqDQKg&s", "description": "Three bright blue horses with curved necks in rolling landscape, painted with bold unnatural colors including blues, reds, yellows, and greens expressing spiritual connection with nature"},
    {"title": "Tower of Blue Horses", "artist": "Franz Marc", "style": "expressionism", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgazaZPVnUsYRL3lyvrZLZGbL8zjAgPThr0Q&s", "description": "Mountain landscape with geometric forms and bold colors in blues, greens, and earth tones showing stylized Tyrolean countryside with expressive color symbolism"},
    
    # Pop Art
    {"title": "Campbell's Soup Cans", "artist": "Andy Warhol", "style": "pop art", "image_url": "https://www.moma.org/d/assets/W1siZiIsIjIwMTUvMTAvMjEvOTY0aWFsdm96Yl9zb3VwY2FuLmpwZyJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ/soupcan.jpg?sha=9a38fb887eb28928", "description": "Mass-produced consumer product rendered as art with red and white soup can labels presented in grid format, painted with flat colors and commercial graphics elevating everyday object"},
    {"title": "Marilyn Diptych", "artist": "Andy Warhol", "style": "pop art", "image_url": "https://upload.wikimedia.org/wikipedia/en/8/87/Marilyndiptych.jpg", "description": "Repeated silkscreen portrait of Marilyn Monroe in bright pink, yellow, blue, and green with high contrast and commercial printing aesthetic celebrating celebrity culture"},
    {"title": "Whaam!", "artist": "Roy Lichtenstein", "style": "pop art", "image_url": "https://upload.wikimedia.org/wikipedia/en/b/b7/Roy_Lichtenstein_Whaam.jpg", "description": "Comic book style war scene with fighter jet firing missile with explosion and bold text, painted with Ben-Day dots in primary reds, yellows, and blues mimicking printed comics"},
    {"title": "Drowning Girl", "artist": "Roy Lichtenstein", "style": "pop art", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwlqVkFEDZQo336DXM0fZN94DwVDtVaWnNRw&s", "description": "Woman's face in water with thought bubble text in comic book style, painted with Ben-Day dots in blues and flesh tones with thick black outlines depicting melodramatic romance"},
    {"title": "Just What Is It That Makes Today's Homes So Different, So Appealing?", "artist": "Richard Hamilton", "style": "pop art", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6cpVygLN80xQ_UD1SpL0FuZKZJ41SUvI0SA&s", "description": "Collage interior with bodybuilder and pin-up surrounded by consumer products and advertisements, assembled from magazine clippings in vibrant colors critiquing consumer culture"},
    {"title": "I Was a Rich Man's Plaything", "artist": "Eduardo Paolozzi", "style": "pop art", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLB-59Q4t5jpg4MzjKvK9BTFhf1a4B9LJCJg&s", "description": "Early pop art collage with pin-up girl, Coca-Cola logo, fighter plane and text fragments from magazines, assembled in reds, blues, and blacks exploring mass media imagery"},
    {"title": "Flag", "artist": "Jasper Johns", "style": "pop art", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrzvlIft-iKjTa7WgNB5RLra2WsggzGodHzA&s", "description": "American flag rendered with encaustic and collage technique with textured surface, painted in red, white, and blue transforming patriotic symbol into abstract painterly object"},
    {"title": "Target with Four Faces", "artist": "Jasper Johns", "style": "pop art", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdpIDQI4gCuHTJ0M_nrKnx3staMn7cNfvrjw&s", "description": "Concentric circles target in red, yellow, and blue with plaster cast faces above in compartments, combining painting and sculpture with everyday imagery"},
    {"title": "Eight Elvises", "artist": "Andy Warhol", "style": "pop art", "image_url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpnQBPaxbj1MKU7b3OvPhK2G-4TafmEfPuYA&s", "description": "Repeated silkscreen images of Elvis Presley as cowboy in silver and black creating rhythmic pattern, exploring celebrity, repetition, and mass production"},
    {"title": "Green Coca-Cola Bottles", "artist": "Andy Warhol", "style": "pop art", "image_url": "https://whitneymedia.org/assets/artwork/3253/68_25_cropped.jpg", "description": "Grid of repeated Coca-Cola bottles in black and white showing mass-produced consumer product as art subject, painted with silkscreen technique emphasizing uniformity and commercialism"},
]


def generate_painting_embedding(painting):
    """Generate embedding for a painting using text description"""
    try:
        # Create a comprehensive text prompt from painting attributes
        text_prompt = f"{painting['title']} by {painting['artist']}, {painting['style']} painting. {painting['description']}"
        
        print(f"  Generating embedding from description: {text_prompt[:100]}...")
        embedding = get_text_embedding(text_prompt)
        return embedding
    except Exception as e:
        raise Exception(f"Failed to generate embedding for {painting['title']}: {str(e)}")


def populate_database():
    """Populate the database with paintings and their embeddings"""
    db = SessionLocal()
    
    try:
        print(f"Starting to populate database with {len(PAINTINGS)} paintings...")
        
        # Check if paintings already exist
        check_query = text("SELECT COUNT(*) FROM paintings")
        result = db.execute(check_query)
        count = result.scalar()
        
        if count > 0:
            print(f"\nDatabase already contains {count} paintings.")
            response = input("Do you want to clear and repopulate? (yes/no): ")
            if response.lower() != 'yes':
                print("Skipping population.")
                return
            
            # Clear existing paintings
            delete_query = text("DELETE FROM paintings")
            db.execute(delete_query)
            db.commit()
            print("Cleared existing paintings.")
        
        # Insert paintings with embeddings
        insert_query = text("""
            INSERT INTO paintings (title, artist, image_url, style, description, embedding)
            VALUES (:title, :artist, :image_url, :style, :description, :embedding)
        """)
        
        success_count = 0
        for i, painting in enumerate(PAINTINGS, 1):
            try:
                print(f"Processing {i}/{len(PAINTINGS)}: {painting['title']} by {painting['artist']}...")
                
                # Generate embedding
                embedding = generate_painting_embedding(painting)
                
                # Insert into database
                db.execute(insert_query, {
                    "title": painting["title"],
                    "artist": painting["artist"],
                    "image_url": painting["image_url"],
                    "style": painting["style"],
                    "description": painting["description"],
                    "embedding": embedding
                })
                
                success_count += 1
                
                # Commit every 10 paintings to avoid losing progress
                if i % 10 == 0:
                    db.commit()
                    print(f"  ✓ Committed {i} paintings")
                
            except Exception as e:
                print(f"  ✗ Error processing {painting['title']}: {str(e)}")
                continue
        
        # Final commit
        db.commit()
        
        print(f"\n{'='*60}")
        print(f"Successfully populated {success_count}/{len(PAINTINGS)} paintings!")
        print(f"{'='*60}")
        
        # Verify the insertion
        verify_query = text("SELECT COUNT(*) FROM paintings")
        result = db.execute(verify_query)
        final_count = result.scalar()
        print(f"\nTotal paintings in database: {final_count}")
        
        # Show sample of inserted paintings
        sample_query = text("""
            SELECT title, artist, style 
            FROM paintings 
            ORDER BY created_at DESC 
            LIMIT 5
        """)
        samples = db.execute(sample_query).fetchall()
        
        print("\nSample of inserted paintings:")
        for sample in samples:
            print(f"  - {sample.title} by {sample.artist} ({sample.style})")
        
    except Exception as e:
        print(f"\n✗ Error during population: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("="*60)
    print("Art Recommendation System - Database Population")
    print("="*60)
    print("\nThis script will populate the database with 100+ famous paintings")
    print("and generate embeddings for each one using CLIP.\n")
    
    try:
        populate_database()
        print("\n✓ Database population completed successfully!")
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Failed to populate database: {str(e)}")
        sys.exit(1)
