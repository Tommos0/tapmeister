const ce = (name, attrs = {}, nested = []) => {
  const elm = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.keys(attrs).forEach(attr => elm.setAttribute(attr, attrs[attr]));
  nested.forEach(e => elm.appendChild(e));
  return elm;
};

window.addEventListener('DOMContentLoaded', async () => {
  await document.documentElement.requestFullscreen();

  // game vars
  let disappearSpeed = 2;
  let appearSpeed = 1;
  let width;
  let height;
  let widthScale;
  let heightScale;
  let speedIncreaseInterval;
  let gameOver = true;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('highScore')) || 0;
  let makeCircleTimeout = null;

  // elements etc
  const menu = document.getElementById('menu');
  const svg = document.querySelector('svg');
  const nodeMap = new Map();

  // audio
  const context = new AudioContext();
  const o = context.createOscillator();
  const g = context.createGain();
  o.connect(g);
  g.connect(context.destination);
  g.gain.value = 0;
  o.start(0);

  const updateMenu = () => {
    document.getElementById('high_score').innerText = highScore.toString();
    document.getElementById('last_score').innerText = score.toString();
  };

  const setSize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    widthScale = width<height ? 1 : width/height;
    heightScale = height<width ? 1 : height/width;
    document.body.style.padding =  width < height ? '10vw' : '10vh';
  };
  setSize();
  window.onresize = setSize;

  const handleGameOver = () => {
    gameOver = true;
    clearTimeout(makeCircleTimeout);
    nodeMap.forEach(circle => {
      clearTimeout(circle.timeout);
    });
    clearInterval(speedIncreaseInterval);
    setTimeout(() => {
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore.toString());
      }
      updateMenu();
      menu.style.display = 'block';
      svg.style.display = 'none';
    }, 1000);
  };

  const tapCircle = (circle) => {
    if (!gameOver) {
      score += 1;
      g.gain.value = 1;
      g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.1);
      clearTimeout(circle.timeout);
      nodeMap.delete(circle.element);
      svg.removeChild(circle.element);
    }
  };

  const makeCircle = () => {
    const svgCircle =  ce('circle', {
      cx: 50 + widthScale * 100 * (Math.random() - .5),
      cy: 50 + heightScale * 100 * (Math.random() - .5),
      r: '10',
      style: `transition: opacity ${disappearSpeed}s ease-in, fill ${disappearSpeed}s ease-in`,
    });
    const circle = {
      element: svgCircle,
      timeout: null,
    };
    circle.timeout = setTimeout(handleGameOver, disappearSpeed * 1000);
    nodeMap.set(svgCircle, circle);
    svgCircle.onclick = e => tapCircle(nodeMap.get(e.target));
    svg.appendChild(svgCircle);
    setTimeout(() => svgCircle.classList.add('disappear'), 50);
    makeCircleTimeout = setTimeout(makeCircle, appearSpeed * 1000);
  };

  const startGame = () => {
    score = 0;
    gameOver = false;
    svg.innerHTML = '';
    disappearSpeed = 4;
    appearSpeed = 2;
    speedIncreaseInterval = setInterval(() => appearSpeed *= 0.99, 1000);
    menu.style.display = 'none';
    svg.style.display = 'block';
    makeCircleTimeout = makeCircle();
  };

  document.getElementById('start').onclick = startGame;
  updateMenu();
});


