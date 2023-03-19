# AI workout planner using OpenAI Chat API

This repo contains a very simple example on how ChatGPT functionality can be built into your own app. 

## App worklfow

The main appp displays a list of different trainings that is loaded from a static JSON file. By default, the training details column is empty. Then, we ask OpenAI Chat Completion API to give us a suggestion for the workout based on the place and the type of the workout.

## Trying it out

To try out the app, you first need to serve the workouts list from the JSON file. `json-server` is a good solution for that, so you can start by running the command:

```npx json-server data.json --port 5000```

This will start a basic CRUD REST API for our workouts inside the `data.json` file. Next, you need to slightly modify the code, and replace the `OPENAI_API_KEY` variable's value with your actual API key value. You can generate your OpenAI API key here: https://platform.openai.com/account/api-keys

Once it is done, you can start the app by running

```npx serve```

inside the root folder. Now you can visit the app on `localhost:3000` and see how it works.

## Improvement ideas

This is a very tiny proof-of-concept, so there are several things that could be improved:
- Add feature to create new workouts. Each time you add a new one, ChatGPT could generate its program right after the creation.
- Currently we batch update all the empty training details fields from ChatGPT. This could be done in a more fine-grained way, so that the text would be updated on the UI step by step.
- An actual backend could be implemented instead of the fake JSON server. This could change the app in several ways, like we could have the server do the ChatGPT API calls, create our own API that wraps it, based on anyone's favour.
- Using some nice framework like React or Next.js and making a real app out of it. 
