const liveGame = await fetch('live-game.json').then((response) => response.json());

document.querySelector('[data-retry]').addEventListener('click', () => location.replace(liveGame.address));
