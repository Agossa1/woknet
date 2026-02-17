-- Migration pour ajouter la fonctionnalité de couleur d'arrière-plan aux posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS background_color VARCHAR(50);
