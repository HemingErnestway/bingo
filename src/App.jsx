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
    const storedState = localStorage.getItem("bingoState")
    const currentKey = getBingoKeyUTC()

    if (storedState) {
      const { date: storedKey, phrases: storedPhrases } = JSON.parse(storedState)

      if (currentKey === storedKey) {
        setShuffledPhrases(storedPhrases)
        return
      } 
    }

    const newPhrases = shuffle(bingo.phrases).slice(0, 25)

    const reshapedPhrases = newPhrases.map(phrase => ({
      text: phrase,
      selected: false,
    }))

    localStorage.setItem("bingoState", JSON.stringify({ 
      date: currentKey, 
      phrases: reshapedPhrases,
      wasBingo: false,
    }))

    setShuffledPhrases(reshapedPhrases)   
  }, [])

  return (
    <div className="wrapper">
      <div className="container">
        <div className="text-container">
          <p>Бинго фраз и действий Дмитрия Викторовича.</p>
          <div className="columns">
            <p>
              Всего карточек в паке сейчас: {bingo.phrases.length}. Берутся 25 рандомных, у каждого игрока разные.
            </p>
            <p>
              Когда ДВ ультует своей своей коронной фразой/действием, нужно выбрать карточку.
            </p>
            <p>
              Игрок, собравший бинго, должен незамедлительно включить микрофон и заорать «ГОООЙДА!» на весь дискорд.
            </p>
          </div>
        </div> 
      </div>
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

function getBingoKeyUTC() {
  const now = new Date()

  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const date = now.getUTCDate()
  const hour = now.getUTCHours()

  const baseDate = new Date(Date.UTC(year, month, date))
  if (hour < 5) {
    // treat it as yesterday
    baseDate.setUTCDate(baseDate.getUTCDate() - 1)
  }

  const y = baseDate.getUTCFullYear()
  const m = String(baseDate.getUTCMonth() + 1).padStart(2, "0")
  const d = String(baseDate.getUTCDate()).padStart(2, "0")

  return `${y}-${m}-${d}`
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
