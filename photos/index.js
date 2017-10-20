const photosElement = document.querySelector('.photos')
const shuffle = (arr)=>arr
  .reduce((arr, item)=>{
    arr.splice(Math.floor(Math.random() * arr.length), 0, item)
    return arr
  }, [])

fetch('https://picsum.photos/list')
  .then(x=>x.json())
  .then(data=>{
    shuffle(data).slice(0,90).forEach(({id}, index)=>{
      const div = document.createElement('div')
      div.classList.add('img')
      const img = document.createElement('img')
      div.appendChild(img)
      window.setTimeout(()=>{
        img.src = `https://picsum.photos/200/200?image=${id}&nocache=${Date.now()}`
        img.onload = ()=>{
          photosElement.appendChild(div)
        }
      }, index * 100)
    })
  })