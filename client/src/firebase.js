import { initializeApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import {
  getFirestore,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  collection,
} from "firebase/firestore"

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
const db = getFirestore(app)

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

async function create() {
  try {
    const user = auth.currentUser
    const userRef = doc(db, "users", user.uid)

    const stats = {
      currStreak: 0,
      maxStreak: 0,
      totalGames: 0,
      totalWins: 0,
      totalGuesses: 0,
      totalTimeInGamesWon: 0,
    }

    await setDoc(userRef, stats)
    console.log("Document written for userID: ", user.uid)
  } catch (e) {
    console.error("Error adding document: ", e)
  }
}

async function update() {
  try {
    const user = auth.currentUser
    const userRef = doc(db, "users", user.uid)

    const data = {
      stats: {
        currStreak: 1,
        maxStreak: 1,
        totalGames: 1,
        totalWins: 1,
        totalGuesses: 1,
        totalTimeInGamesWon: 1,
      },
      games: {
        game1: 0,
        game2: 0,
      },
    }

    await updateDoc(userRef, {
      "stats.currStreak": 2,
    })

    // ? To update nested fields, use dot notation.

    // await updateDoc(userRef, {
    //   "stats.currStreak": 2,
    // })

    console.log("Document updated for userID: ", user.uid)
  } catch (e) {
    console.error("Error updating document: ", e)
  }
}

async function retrieve() {
  try {
    const user = auth.currentUser
    const userRef = doc(db, "users", user.uid)
    const docSnap = await userRef.get()
    // const docSnap = await getDoc(userRef) // ? Alternative
    if (docSnap.exists()) {
      console.log("Document data: ", docSnap.data())
    } else {
      console.log("No such document!")
    }
  } catch (e) {
    console.error("Error retrieving document: ", e)
  }
}

export { auth, db, register, login, create, update, retrieve }
