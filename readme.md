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

<a name="build"></a>
## Build

1. Intiate gulp js-build task with environment flag, `--staging` or `--production`

    ```
  gulp js-build --staging
    ```

<a name="deploy"></a>
## Deploy

1. Merge into a deployment branch (staging, production)
1. `git push`
1. SSH into that server
1. `git pull`