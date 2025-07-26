import bingo from "../bingo.json"
import { useState, useEffect } from "react"

function Card({ text, selected, handleClick }) {
  return (
    <div 
      className={`card${selected ? " selected" : ""}`} 
      lang="ru"
      onClick={handleClick}
    >
      {text}
    </div>
  ) 
}

function Grid({ phrases, setPhrases }) {
  function handleSelect(index) {
    const newPhrases = [...phrases]
    newPhrases[index].selected = !newPhrases[index].selected
    setPhrases(newPhrases)
  }

  return (
    <div className="grid">
      {phrases.map((phrase, index) => (
        <Card 
          text={phrase.text} 
          selected={phrase.selected}
          handleClick={() => handleSelect(index)}
          key={phrase.text} 
        />
      ))}
    </div>
  )  
}

export function App() {
  const [shuffledPhrases, setShuffledPhrases] = useState([])
  const [wasBingo, setWasBingo] = useState(false)

  useEffect(() => {
    if (shuffledPhrases.length !== 0) {
      const { date } = JSON.parse(localStorage.getItem("bingoState"))

      localStorage.setItem("bingoState", JSON.stringify({
        date,
        phrases: shuffledPhrases,
      }))
    }

    if (isBingo(shuffledPhrases)) {
      if (wasBingo) return
      setWasBingo(true)
      alert("БИНГОООООООЛ!")
    } else {
      setWasBingo(false)
    }
  }, [shuffledPhrases, wasBingo]) 

  useEffect(() => {
    const stored = localStorage.getItem("bingoState")
    const today = getTodayKey()
    const afterSeven = isAfterSeven()

    if (stored) {
      const { date, phrases: currentPhrases } = JSON.parse(stored)

      if (date === today || !afterSeven) {
        setShuffledPhrases(currentPhrases)
        return
      }
    }

    const newPhrases = shuffle(bingo.phrases).slice(0, 25)

    const reshapedPhrases = newPhrases.map(
      phrase => ({
        text: phrase,
        selected: false,
      })
    )

    localStorage.setItem("bingoState", JSON.stringify({ 
      date: today, 
      phrases: reshapedPhrases,
      wasBingo: false,
    }))

    setShuffledPhrases(reshapedPhrases)
  }, [])

  return (
    <div className="wrapper">
      <div className="container">
        <Grid 
          phrases={shuffledPhrases} 
          setPhrases={setShuffledPhrases}
        />
      </div>
    </div>
  )
}

function shuffle(array) {
  const arr = [...array]

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr
}

function isAfterSeven() {
  const now = new Date()
  const moscowHours = (now.getUTCHours() + 3) % 24
  return moscowHours >= 1
}

function getTodayKey() {
  const now = new Date()
  return now.toISOString().split("T")[0]
}

function isBingo(phrases) {
  if (phrases.length === 0) return

  let selection = []

  for (let i = 0; i < phrases.length; i += 5) {
    selection.push(phrases.slice(i, i + 5))
  }

  // rows 
  for (let row of selection) {
    if (row.every(phrase => phrase.selected)) return true
  }

  // cols
  for (let i = 0; i < 5; ++i) {
    let col = []
    for (let j = 0; j < 5; ++j) {
      col.push(selection[j][i])
    }
    if (col.every(phrase => phrase.selected)) return true
  }

  // diagonal
  const [primaryDiagonal, secondaryDiagonal] = getDiagonals(selection)
  if (primaryDiagonal.every(phrase => phrase.selected)) return true
  if (secondaryDiagonal.every(phrase => phrase.selected)) return true
  
  return false
}

function getDiagonals(matrix) {
  const n = matrix.length
  const primaryDiagonal = []
  const secondaryDiagonal = []

  for (let i = 0; i < n; ++i) {
    primaryDiagonal.push(matrix[i][i])
    secondaryDiagonal.push(matrix[i][n - 1 - i]) 
  }

  return [primaryDiagonal, secondaryDiagonal]
}
