# 42 Présence — mini app PWA

Cette version est prête à être hébergée comme une Progressive Web App.

Fichiers :
- index.html : l'application
- manifest.webmanifest : informations d'installation Android
- sw.js : cache hors ligne
- icon-192.png / icon-512.png : icônes

## Important
Une PWA doit être servie en HTTPS (ou sur localhost) pour pouvoir être installée proprement.
Ouvrir `index.html` directement depuis le gestionnaire de fichiers Android ne suffit pas pour le mode PWA/hors-ligne.

## Déploiement simple avec GitHub Pages
1. Créer un dépôt GitHub, par exemple `presence42`.
2. Mettre les 5 fichiers de ce dossier à la racine du dépôt.
3. Dans GitHub : Settings > Pages.
4. Dans "Build and deployment", choisir "Deploy from a branch".
5. Choisir la branche `main` et le dossier `/ (root)`, puis Save.
6. Ouvrir l'adresse GitHub Pages générée sur le téléphone.
7. Dans Chrome : menu ⋮ > "Installer l'application" ou "Ajouter à l'écran d'accueil".

Les données sont stockées localement sur le téléphone via localStorage.
Utiliser l'export JSON de temps en temps pour garder une sauvegarde.
