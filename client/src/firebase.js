import { initializeApp } from "firebase/app"

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyA9LEYP2krpuocUWKM1WmwAogUl5fImwbo",
  authDomain: "wordle-forever-6b8a0.firebaseapp.com",
  projectId: "wordle-forever-6b8a0",
  storageBucket: "wordle-forever-6b8a0.appspot.com",
  messagingSenderId: "110121627544",
  appId: "1:110121627544:web:5e3c2a2030431e80d805ed",
  measurementId: "G-2SZBFW0J4T",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Firestore experiments
function register() {
  const email = "test2@test.com"
  const password = "password"

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user
      console.log("User registered: ", user)
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.log("Error registering user: ", errorMessage)
    })
}

function login() {
  const email = "test@test.com"
  const password = "password"

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user
      console.log("User logged in: ", user)
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.log("Error logging in user: ", errorMessage)
    })
}

export { auth, register, login }
