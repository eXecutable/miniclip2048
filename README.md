# 2048 Miniclip exercise

This is a no game frameworks/engines 2048 game in WebGL2.

## Arquitecture Overview

Firstly index.js loads the static global objects. Once they are completly initialized MainMenuScreen is displayed and navigation starts from there.

#### Screens
The application is composed of Screens: MainMenuScreen, HighScoreScreen and GameScreen. The screens care about updating the application state.
#### Renderers
Every screen has a Renderer associated. Renderers draw the elements on to the screen for the current state.
#### Helpers
Helper objects encapsulate shaders and WebGL calls.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes

### Prerequisites

Have npm (https://www.npmjs.com/) installed.

Visual Code settings are available.

### Installing

Clone the repo to your machine

```
git clone https://github.com/eXecutable/miniclip2048.git
```

Download dependencies

```
npm install
```

Start webpack development server

```
npm run serve
```

Access the website. (Simply press F5 in VSCode)
```
http://localhost:8080/
```

## Running the tests

Launch the test server
```
npm run test
```

Navigate to the index_test.html

### Adding new tests

Since we are using ES6 to add tests go to run.js and import the desired module
```
import "./../src/game/Tile.test.js";
import "./../src/game/Grid.test.js";

mocha.checkLeaks();
mocha.run();
```

## Built With

* [Webpack](https://webpack.js.org/) - Javascript bundler
* [npm](https://www.npmjs.com/) - Dependency Management