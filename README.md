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


## Mises à jour et notes de version

La version 1.1.0 ajoute une bannière « Mettre à jour », une vérification manuelle
et les notes de version dans Données. La vérification a lieu au lancement,
au retour dans l’app, au rétablissement de la connexion et toutes les cinq minutes
lorsque l’app est visible. La nouvelle version est téléchargée puis attend le clic
sur « Mettre à jour » ; l’app se recharge après activation. Les nouveautés
s’affichent une fois par version, et l’historique reste consultable dans Données.
Le cache hors ligne est conservé et les données `presence42_v1` ne sont pas modifiées.

Pour chaque future livraison :
1. Incrémenter `APP_VERSION` dans index.html et ajouter une entrée en tête de `RELEASES`
   avec la date et une liste de changements en français.
2. Utiliser la même version dans `CACHE` de sw.js, afin de déclencher la mise à jour.
3. Publier ces deux fichiers ensemble. Ne pas ajouter `skipWaiting()` dans install.
4. Vérifier le passage depuis la version précédente, le mode hors ligne et la
   conservation des sessions et du badge actif.

### Première migration depuis la version 1.0

L’ancienne version ne comporte aucun bouton de mise à jour. Ouvrir l’app connectée,
la fermer puis la rouvrir après le téléchargement permet de recevoir ce nouveau
système. Les mises à jour suivantes se feront depuis la bannière.
