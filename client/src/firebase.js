import { initializeApp } from "firebase/app"

import { getAuth } from "firebase/auth"

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

export { auth }
