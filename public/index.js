const cvs = document.getElementById('canvas')
const ctx = cvs.getContext('2d')
let size = 8 // qtd de rainhas e tamanho do tabuleiro size*size
drawChess()

document.querySelector('input').addEventListener('keyup', function (event) {
  let key = event.keyCode || event.key

  if (key === 13) {
    event.preventDefault()
    document.querySelector('button').click()
  }
})

function getSize() {
  const value = document.getElementById('size').value

  if (!value || value <= 0) {
    alert(
      'A quantidade de rainhas foi inválida...\n Vamos fazer com 8 rainhas.'
    )
    document.getElementById('size').value = 8
    return 8
  }

  return value
}

function drawChess() {
  // ctx.fillStyle = 'red'
  // ctx.fillRect(5, 0, 1, 1)
  cvs.width = size
  cvs.height = size
  let resto = 0

  for (let i = 0; i < size; i++) {
    if (resto === 0) {
      resto = 1
    } else {
      resto = 0
    }
    for (let j = 0; j < size; j++) {
      ctx.fillStyle = '#fff'
      if (j % 2 === resto) {
        ctx.fillStyle = '#aaaaaa'
        ctx.fillRect(j, i, 1, 1)
      }
    }
  }
}

function setMovement(value) {
  console.log('[!] mov', value)
  document.querySelector('#movement').textContent = value
}

function init() {
  size = getSize()

  drawChess()
  console.time('exec')
  const mngMatrix = manageMatrix()
  const matrix = mngMatrix.createMatrix(size)

  let queens = searchQueensAndCalcWeight().genQueensInRandomPositions()
  mngMatrix.setQueensInMatrix(queens)
  start()
  console.log('[!] Quantidade de rainhas -> ', size)
  console.timeEnd('exec')

  function manageMatrix() {
    let countMove = 0
    function createMatrix(size) {
      let matrix = []
      for (let i = 0; i < size; i++) {
        matrix[i] = []
        for (let j = 0; j < size; j++) {
          matrix[i][j] = { queen: false, color: null }
        }
      }
      return matrix
    }
    function move(line, column, dLine, dColumn) {
      matrix[dLine][dColumn] = matrix[line][column]
      // console.log(`[->] movendo de ${line}:${column} para ${dLine}:${dColumn}`)
      matrix[line][column] = { queen: false, color: null }
      this.countMove++
    }
    function setQueensInMatrix(queens) {
      queens.map(({ line, column }) => {
        matrix[line][column].queen = true
      })
    }

    return { createMatrix, move, setQueensInMatrix, countMove }
  }

  function randomRGB() {
    const R = Math.floor(Math.random() * 200) + 55
    const G = Math.floor(Math.random() * 200) + 55
    const B = Math.floor(Math.random() * 200) + 55
    return { R, G, B }
  }

  function showMatrixwithQueens() {
    for (let i = 0; i < size; i++) {
      let str = ''
      for (let j = 0; j < size; j++) {
        str += `${matrix[i][j].queen ? 'x ' : 'o '}`
        // console.log(`${matrix[i][j].queen ? 'x' : 'o'}`)
      }
      console.log(str)
    }
  }

  function start() {
    let count = 0
    renderScreen(false)
    setTimeout(() => {
      const loop = setInterval(() => {
        count = 0
        queens.map(queen => {
          const { flag, line, column } = searchQueensAndCalcWeight().start(
            queen.line,
            queen.column
          )

          if (flag) {
            queen.line = line
            queen.column = column
            renderScreen(false)
          } else {
            count++
          }
        })
        if (count >= size) {
          showMatrixwithQueens()
          setMovement(mngMatrix.countMove)
          console.log(
            `[!] finalizado, total de movimentos -> ${mngMatrix.countMove}`
          )
          clearInterval(loop)
        }
      }, 50)
    }, 700)
  }

  // funcao start que nao tem delay e nem animacao
  // function start() {
  //   let count = 0
  //   while (count < size) {
  //     count = 0
  //     queens.map(queen => {
  //       const { flag, line, column } = searchQueensAndCalcWeight().start(
  //         queen.line,
  //         queen.column
  //       )

  //       if (flag) {
  //         queen.line = line
  //         queen.column = column
  //       } else {
  //         count++
  //       }
  //     })
  //   }
  //   console.log(queens)
  //   showMatrixwithQueens(queens)
  //   renderScreen(false)
  //   console.log(`[!] finalizado, total de movimentos -> ${mngMatrix.countMove}`)
  // }

  function searchQueensAndCalcWeight() {
    function start(line, column) {
      const { flag, line: dLine, column: dColumn } = getWeightsPerPosition(
        line,
        column
      )

      if (flag) {
        mngMatrix.move(line, column, dLine, dColumn)
        return { flag: true, line: dLine, column: dColumn }
      }
      return { flag: false, line, column }
    }

    function genQueens() {
      let queens = []
      for (let j = 0; j < size; j++) {
        const { R, G, B } = randomRGB()
        matrix[0][j].queen = true
        queens.push({ line: 0, column: j, R, G, B })
      }
      return queens
    }

    function genQueensInRandomPositions() {
      let queens = []

      while (queens.length < size) {
        let line = Math.floor(Math.random() * size)
        let column = Math.floor(Math.random() * size)

        let equalPosition = queens.find(
          queen => queen.line === line && queen.column === column
        )

        if (!equalPosition) {
          const { R, G, B } = randomRGB()
          queens.push({ line, column, R, G, B })
        }
      }

      // console.log(queens)
      return queens
    }

    function getWeightsPerPosition(line, column) {
      const result = []

      result.push(searchTop(line, column))
      result.push(searchRight(line, column))
      result.push(searchBottom(line, column))
      result.push(searchLeft(line, column))

      result.push(searchRightToBottom(line, column))
      result.push(searchRightToTop(line, column))
      result.push(searchLeftToBottom(line, column))
      result.push(searchLeftoToTop(line, column))

      let count = 0

      result.map(element => {
        //se nao for rainhas ele conta
        if (!element.flag) {
          count++
        }
      })

      if (count === result.length) {
        //nao se mexe, nao tem nenhuma rainha mirando nele
        // console.log(`[!] Não é necessario se mexer`)
        return { flag: false }
      }
      let AllPoints = []
      result.map(element => {
        element.position.map(point => {
          let countQueen = 0
          if (searchTop(point.line, point.column).flag) {
            countQueen++
          }
          if (searchRight(point.line, point.column).flag) {
            countQueen++
          }
          if (searchBottom(point.line, point.column).flag) {
            countQueen++
          }
          if (searchLeft(point.line, point.column).flag) {
            countQueen++
          }
          if (searchRightToBottom(point.line, point.column).flag) {
            countQueen++
          }
          if (searchRightToTop(point.line, point.column).flag) {
            countQueen++
          }
          if (searchLeftToBottom(point.line, point.column).flag) {
            countQueen++
          }
          if (searchLeftoToTop(point.line, point.column).flag) {
            countQueen++
          }
          point.value = countQueen - 1 // -1 é para tirar a rainha que esta querendo andar
          AllPoints.push(point)
        })
      })

      //ordenar por menos rainhas no perimetro
      AllPoints.sort((a, b) => {
        return a.value - b.value
      })
      // console.log(AllPoints)
      return { flag: true, ...AllPoints[0] } // melhor posicao naquele momento
    }

    function searchTop(line, column) {
      let flag = false
      const position = []

      for (let i = line; i >= 0; i--) {
        if (i !== line) {
          if (matrix[i][column].queen) {
            // console.log(`[!] Rainha encontrada -> linha:${i} coluna:${column}`)
            flag = true
            i = -1
          } else {
            position.push({ line: i, column })
          }
        }
      }
      return { flag, position }
    }

    function searchRight(line, column) {
      let flag = false
      const position = []

      for (let j = column; j < size; j++) {
        // console.log(`${line}:${j}`)
        if (j !== column) {
          if (matrix[line][j].queen) {
            // console.log(`[!] Rainha encontrada -> linha:${line} coluna:${j}`)
            flag = true
            j = size
          } else {
            position.push({ line, column: j })
          }
        }
      }
      return { flag, position }
    }

    function searchBottom(line, column) {
      let flag = false
      const position = []

      for (let i = line; i < size; i++) {
        // console.log(`${i}:${column}`)
        if (i !== line) {
          if (matrix[i][column].queen) {
            // console.log(`[!] Rainha encontrada -> linha:${i} coluna:${column}`)
            flag = true
            i = size
          } else {
            position.push({ line: i, column })
          }
        }
      }
      return { flag, position }
    }

    function searchLeft(line, column) {
      let flag = false
      const position = []

      for (let j = column; j >= 0; j--) {
        // console.log(`${line}:${j}`)
        if (j !== column) {
          if (matrix[line][j].queen) {
            // console.log(`[!] Rainha encontrada -> linha:${line} coluna:${j}`)
            flag = true
            j = -1
          } else {
            position.push({ line, column: j })
          }
        }
      }
      return { flag, position }
    }

    //diagonal

    function searchRightToTop(line, column) {
      let flag = false
      let j = column
      const position = []

      for (let i = line; i >= 0; i--) {
        if (j < size) {
          // console.log(`${i}:${j}`)
          if (i !== line && j !== column) {
            if (matrix[i][j].queen) {
              // console.log(`[!] Rainha encontrada -> linha:${i} coluna:${j}`)
              flag = true
              i = -1 //break loop
            } else {
              position.push({ line: i, column: j })
            }
          }

          j++
        }
      }

      return { flag, position }
    }

    function searchLeftoToTop(line, column) {
      let flag = false
      let j = column
      const position = []

      for (let i = line; i >= 0; i--) {
        if (j >= 0) {
          // console.log(`${i}:${j}`)
          if (i !== line && j !== column) {
            if (matrix[i][j].queen) {
              // console.log(`[!] Rainha encontrada -> linha:${i} coluna:${j}`)
              flag = true
              i = -1 //break loop
            } else {
              position.push({ line: i, column: j })
            }
          }

          j--
        }
      }
      return { flag, position }
    }

    function searchRightToBottom(line, column) {
      let flag = false
      let j = column
      const position = []

      for (let i = line; i < size; i++) {
        if (j < size) {
          // console.log(`${i}:${j}`)
          if (i !== line && j !== column) {
            if (matrix[i][j].queen) {
              // console.log(`[!] Rainha encontrada -> linha:${i} coluna:${j}`)
              flag = true
              i = size //break loop
            } else {
              position.push({ line: i, column: j })
            }
          }

          j++
        }
      }
      return { flag, position }
    }

    function searchLeftToBottom(line, column) {
      let flag = false
      let j = column
      const position = []

      for (let i = line; i < size; i++) {
        if (j >= 0) {
          // console.log(`${i}:${j}`)
          if (i !== line && j !== column) {
            if (matrix[i][j].queen) {
              // console.log(`[!] Rainha encontrada -> linha:${i} coluna:${j}`)
              flag = true
              i = size //break loop
            } else {
              position.push({ line: i, column: j })
            }
          }

          j--
        }
      }
      return { flag, position }
    }

    return {
      start,
      genQueens,
      genQueensInRandomPositions
    }
  }

  function renderScreen(flag = true) {
    ctx.clearRect(0, 0, size, size)
    drawChess()
    queens.map(queen => {
      const { line, column, R, G, B } = queen

      ctx.fillStyle = `rgb(${R},${G},${B})`
      ctx.fillRect(column, line, 1, 1)
    })
    if (flag) {
      requestAnimationFrame(renderScreen)
    }
  }
}
