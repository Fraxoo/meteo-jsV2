# projet-MeteoV2

## Prérequis

Avant de lancer le projet, assurez-vous d’avoir **Apache 2.4 ou supérieur**.

---

## Lancer le projet avec Docker

### 1. Construire l’image Docker

Exécutez la commande suivante à la racine du projet :

```bash
docker build -t nomdelimage .
```

---

### 2. Lancer le conteneur

Une fois l’image construite, lancez le conteneur avec :

```bash
docker run -dit --name nomducontainer -p 8080:80 nomdelimage
```

Le projet sera ensuite accessible à l’adresse suivante :

```txt
http://localhost:8080
```

---

## Note

Si le port `8080` est déjà utilisé, vous pouvez le remplacer par un autre port.

Exemple :

```bash
docker run -dit --name burger -p 8070:80 nomdelimage
```