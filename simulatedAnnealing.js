function init(size) {
  // const size = 128 // qtd de rainhas e tamanho do tabuleiro size*size

  let begin = Date.now()

  const mngMatrix = manageMatrix()
  const matrix = mngMatrix.createMatrix(size)
  start(100)

  let end = Date.now()
  let endTime = end - begin

  const used = process.memoryUsage().heapUsed / 1024 / 1024
  let memoryUsed = Math.round(used * 100) / 100

  return [size, endTime, memoryUsed, mngMatrix.countMove]

  // console.log('[!] Quantidade de rainhas -> ', size)
  // console.log(`[!] Uso de memória ${Math.round(used * 100) / 100} MB`)

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

  function showMatrixwithQueens() {
    for (let i = 0; i < size; i++) {
      let str = ''
      for (let j = 0; j < size; j++) {
        str += `${matrix[i][j].queen ? 'x ' : 'o '}`
      }
      console.log(str)
    }
  }

  function verifyConclusion(queens) {
    count = 0
    queens.map(queen => {
      const { flag } = searchQueensAndCalcWeight().getWeightsPerPosition(
        queen.line,
        queen.column,
        0
      )
      if (!flag) {
        count++
      }
    })

    if (count === size) {
      console.log('[✅] Solucionado')
      return
    }
    console.log('[X] Não solucionado')
  }

  function start(temperature) {
    let queens = searchQueensAndCalcWeight().genQueensInRandomPositions()
    mngMatrix.setQueensInMatrix(queens)

    while (temperature > 0) {
      queens.map(queen => {
        const { flag, line, column } = searchQueensAndCalcWeight().start(
          queen.line,
          queen.column,
          temperature
        )

        if (flag) {
          queen.line = line
          queen.column = column
        }
      })
      temperature -= 0.01

      // console.log(temperature)
    }
    // showMatrixwithQueens(queens)
    verifyConclusion(queens)
    // console.log(`[!] finalizado, total de movimentos -> ${mngMatrix.countMove}`)
  }

  function searchQueensAndCalcWeight() {
    function start(line, column, temperature) {
      const { flag, line: dLine, column: dColumn } = getWeightsPerPosition(
        line,
        column,
        temperature
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
        matrix[0][j].queen = true
        queens.push({ line: 0, column: j })
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
          queens.push({ line, column })
        }
      }
      return queens
    }

    function getWeightsPerPosition(line, column, temperature) {
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
      let amountQueens = 0

      result.map(element => {
        //se nao for rainhas ele conta
        if (!element.flag) {
          count++
        } else {
          amountQueens++
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
      if (AllPoints.length <= 0) {
        return { flag: false }
      }

      //parte do simulated Annealing

      //escolhe um vizinho aleatorio
      let lenghtAllpoints = AllPoints.length - 1
      const index = Math.floor(Math.random() * lenghtAllpoints)
      let selectedPosition = AllPoints[index]

      const deltaE = amountQueens - selectedPosition.value

      if (deltaE === 0) {
        return { flag: false }
      }
      // console.log('\n[oldPosition] ', line, column, amountQueens)
      // console.log('[selectedPosition] ', selectedPosition)
      // console.log('[deltaE] ', deltaE)
      //posicao melhor do que a atual
      if (deltaE > 0) {
        return { flag: true, ...selectedPosition }
      }

      //caso ele nao seja uma boa posicao
      //ele ainda ganha uma chance
      // let value = Math.exp((deltaE - temperature / 2) / temperature).toFixed(2)
      let value = Math.exp(deltaE / temperature).toFixed(2)
      let probability = (Math.random() * 1).toFixed(2)

      // console.log(
      //   `[deltaE = ${deltaE}][${(value * 100).toFixed(
      //     2
      //   )}%][temperature = ${temperature}]`
      // )

      //value ta dentro da probabilidade
      if (value > probability) {
        // console.log('[LUCKY]')
        return { flag: true, ...selectedPosition }
      }

      // console.log(AllPoints)
      // console.log('[UNLUCKY]')
      return { flag: false } // melhor posicao naquele momento
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
      genQueensInRandomPositions,
      getWeightsPerPosition
    }
  }
}

module.exports = init
