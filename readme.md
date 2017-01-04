# Plutus Front End

1. [Installation](#installation)
1. [Watch](#watch)
1. [Build](#build)
1. [Deploy](#deploy)


<a name="installation"></a>
## Installation

1. Clone the repo

    ```
  git clone git@github.com:TheRafiApp/plutus_frontend.git
    ```
2. Install NPM dependencies

    ```
  npm install
    ```


<a name="watch"></a>
## Watch

1. Run `gulp` to watch scss files and build on save

<a name="environments"></a>
## Environments

1. Switching environments will copy the appropriate config files to where they need to be. Use `dev`, `staging`, or `production`

  ```
  npm setup dev
  ```


<a name="build"></a>
## Build

1. Intiate gulp js-build task with environment flag, `--staging` or `--production`

    ```
  gulp js-build --staging
    ```


<a name="deploy"></a>
## Deploy

1. Merge into a deployment branch (staging, production)

  ```
  git checkout staging
  git merge dev
  ```

1. Commit and push

  ```
  git commit -a -m "message"
  git push
  ```
1. `ssh rafi-staging` or `ssh rafi-production`
1. `/var/www/app/frontend`
1. `git pull`
