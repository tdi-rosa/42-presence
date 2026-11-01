# Dayflow

Dayflow est une PWA mobile personnelle pour organiser la journée sans rigidifier l'emploi du temps : blocs récurrents, timeline quotidienne, semaine, suivi prévu/réalisé des heures à 42 et bilan du soir.

Ce dépôt est l'évolution de **42 Présence**. Les anciennes données `presence42_v1` sont laissées intactes et importées une seule fois dans Dayflow au premier lancement.

## V1

- Vue Jour avec timeline 07:00–23:00.
- Vue Semaine compacte.
- Catégories : 42, obligations/administratif, déménagement, vie quotidienne, association/social, repos.
- Déplacement tactile d'un bloc depuis sa poignée `⋮⋮`, par pas de 15 minutes.
- Blocs hebdomadaires récurrents ; déplacer une occurrence ne change pas toute la série.
- Distinction prévu / réalisé et heures réelles.
- Bouton `42 maintenant` pour enregistrer une session réelle non planifiée.
- Total 42 journalier et hebdomadaire, objectif de référence 35 h/semaine.
- Bilan du soir conservé localement : énergie, points positifs, blocages, note.
- Export JSON complet et export JSON des 14 derniers jours pour analyse dans ChatGPT.
- PWA installable, hors-ligne, stockage local.
- Mise à jour automatique du service worker après nouveau déploiement ; l'app se recharge sur la nouvelle version sans réinstallation.

## Architecture

Aucun framework ni build n'est nécessaire pour la V1.

- `index.html` : structure de l'interface.
- `styles.css` : interface mobile et timeline.
- `app.js` : modèle local, récurrence, interactions, bilans et migration.
- `sw.js` : cache offline et activation automatique des mises à jour.
- `manifest.webmanifest` : installation Android.
- `vercel.json` : en-têtes pour éviter de bloquer les mises à jour du service worker.

Les données principales sont stockées sous `dayflow_v1` dans `localStorage`.

## Déploiement Vercel

Connecter ce dépôt à un projet Vercel et garder `main` comme branche de production. Il n'y a ni commande de build ni dossier de sortie : Vercel sert les fichiers statiques de la racine. Chaque push sur `main` produit alors un nouveau déploiement. Le service worker vérifie aussi les nouvelles versions au lancement, au retour dans l'app, au retour du réseau et périodiquement quand l'app est visible.

## Développement local

Un serveur HTTP local suffit :

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.
