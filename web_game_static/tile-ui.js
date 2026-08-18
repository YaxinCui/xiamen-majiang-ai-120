(function installMahjongTileUI(global) {
  'use strict';

  const CHINESE_NUMERALS = ['一', '二', '三', '四', '伍', '六', '七', '八', '九'];
  const FLOWER_NAMES = ['梅', '兰', '菊', '竹', '春', '夏', '秋', '冬'];
  const PIP_POSITIONS = {
    1: [5], 2: [3, 7], 3: [3, 5, 7], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9], 7: [1, 3, 4, 5, 6, 7, 9], 8: [1, 2, 3, 4, 6, 7, 8, 9],
    9: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  };

  function tileName(tile) {
    if (tile && typeof tile === 'object' && tile.name) return tile.name;
    const id = typeof tile === 'object' ? tile.id : tile;
    if (id >= 0 && id < 27) return `${id % 9 + 1}${['万', '筒', '条'][Math.floor(id / 9)]}`;
    if (id >= 27 && id < 31) return ['东', '南', '西', '北'][id - 27];
    if (id >= 31 && id < 34) return ['红中', '发财', '白板'][id - 31];
    if (id >= 34 && id < 42) return FLOWER_NAMES[id - 34];
    return `未知牌 ${id}`;
  }

  function pipColorClass(rank, position, index) {
    if (rank === 1) return 'pip-multicolor';
    if (rank === 2) return index === 0 ? 'pip-green' : 'pip-blue';
    if (rank === 3) return ['pip-green', 'pip-red', 'pip-blue'][index];
    if (rank === 4) return [1, 9].includes(position) ? 'pip-green' : 'pip-blue';
    if (rank === 5) return position === 5 ? 'pip-red' : ([1, 9].includes(position) ? 'pip-green' : 'pip-blue');
    if (rank === 6) return position <= 3 ? 'pip-green' : 'pip-red';
    if (rank === 7) return index < 3 ? 'pip-green' : 'pip-red';
    if (rank === 8) return 'pip-blue';
    if (rank === 9) return position <= 3 ? 'pip-green' : (position <= 6 ? 'pip-red' : 'pip-blue');
    return 'pip-blue';
  }

  function bambooColorClass(rank, position, index) {
    if (rank === 5) return index === 2 ? 'pip-red' : 'pip-green';
    if (rank === 7) return index === 0 ? 'pip-red' : 'pip-green';
    if (rank === 9) return [1, 4, 7].includes(index) ? 'pip-red' : 'pip-green';
    return 'pip-green';
  }

  function createFace(tile) {
    const id = typeof tile === 'object' ? tile.id : tile;
    const face = document.createElement('span');
    face.className = 'tile-face';

    if (id < 9) {
      face.classList.add('tile-wan');
      face.innerHTML = `<span class="tile-rank">${CHINESE_NUMERALS[id]}</span><span class="tile-unit">萬</span>`;
      return face;
    }
    if (id < 27) {
      const isTong = id < 18;
      const rank = id % 9 + 1;
      face.classList.add(isTong ? 'tile-tong' : 'tile-tiao', `rank-${rank}`);
      if (isTong && rank === 1) {
        face.classList.add('tile-one-circle');
        face.innerHTML = '<svg class="one-circle-wheel" viewBox="0 0 48 58" aria-hidden="true"><circle cx="24" cy="29" r="20" fill="#f5ead6" stroke="#226f92" stroke-width="2.4"/><circle cx="24" cy="29" r="16.5" fill="none" stroke="#2f8a5b" stroke-width="2"/><g stroke="#165b79" stroke-width=".8"><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#2a769c"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#3b955f" transform="rotate(45 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#2a769c" transform="rotate(90 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#3b955f" transform="rotate(135 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#2a769c" transform="rotate(180 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#3b955f" transform="rotate(225 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#2a769c" transform="rotate(270 24 29)"/><ellipse cx="24" cy="17" rx="3.6" ry="7.2" fill="#3b955f" transform="rotate(315 24 29)"/></g><circle cx="24" cy="29" r="8" fill="#f7eddc" stroke="#bb3f35" stroke-width="2"/><path d="M24 20.8l2.2 5.5 5.9-1.4-3.7 4.8 3.7 4.7-5.9-1.3-2.2 5.5-2.2-5.5-5.9 1.3 3.7-4.7-3.7-4.8 5.9 1.4z" fill="#c64638"/><circle cx="24" cy="29" r="2.3" fill="#f2d45d" stroke="#286b8b" stroke-width="1"/></svg>';
        return face;
      }
      if (!isTong && rank === 1) {
        face.classList.add('tile-one-bamboo');
        face.innerHTML = '<svg class="bamboo-bird" viewBox="0 0 44 58" aria-hidden="true"><path d="M14 47c2-12 8-20 17-29-1 12-4 24-11 33z" fill="#19764f"/><path d="M19 45c-1-12 2-24 8-36 4 14 3 27-2 39z" fill="#287baf"/><path d="M24 45c2-10 8-20 14-27-1 13-4 24-10 31z" fill="#c64638"/><ellipse cx="19" cy="24" rx="8" ry="11" fill="#2f8b56"/><path d="M14 22c6 1 11 4 14 9-6 1-11-1-15-5z" fill="#176b9c"/><circle cx="18" cy="12" r="6" fill="#308d59"/><path d="M22 11l8 3-8 3z" fill="#d84b38"/><circle cx="20" cy="11" r="1.2" fill="#102f29"/><path d="M15 7l-2-4m5 4V2m3 6 3-4" stroke="#277b55" stroke-width="1.8" stroke-linecap="round"/></svg>';
        return face;
      }
      const grid = document.createElement('span');
      grid.className = 'pip-grid';
      PIP_POSITIONS[rank].forEach((position, index) => {
        const pip = document.createElement('i');
        const colorClass = isTong
          ? pipColorClass(rank, position, index)
          : bambooColorClass(rank, position, index);
        pip.className = `pip pip-${position} ${colorClass}`;
        grid.append(pip);
      });
      face.append(grid);
      return face;
    }
    if (id < 31) {
      face.classList.add('tile-wind');
      face.textContent = ['东', '南', '西', '北'][id - 27];
      return face;
    }
    if (id < 34) {
      face.classList.add('tile-dragon', `dragon-${id - 31}`);
      if (id === 33) {
        face.classList.add('white-dragon');
        face.innerHTML = '<span class="white-dragon-frame" aria-hidden="true"></span>';
      } else {
        face.textContent = ['中', '發'][id - 31];
      }
      return face;
    }
    face.classList.add('tile-flower');
    face.innerHTML = `<span>❀</span><small>${tileName(tile)}</small>`;
    return face;
  }

  function createTile(tile, {
    clickable = false,
    compact = false,
    forced = false,
    drawn = false,
    lastDiscard = false,
    gold = false,
    goldProxy = false,
    extraClasses = [],
    title = null,
    ariaLabel = null,
    onClick = null,
  } = {}) {
    const id = typeof tile === 'object' ? tile.id : tile;
    const name = tileName(tile);
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'tile';
    node.dataset.tile = id;
    node.title = title || name;
    node.setAttribute('aria-label', ariaLabel || (drawn ? `刚摸到的 ${name}` : name));

    const corner = document.createElement('span');
    corner.className = 'tile-corner';
    corner.textContent = name;
    node.append(corner, createFace(tile));

    node.classList.toggle('gold', gold);
    node.classList.toggle('gold-proxy', goldProxy);
    node.classList.toggle('compact', compact);
    node.classList.toggle('forced', forced);
    node.classList.toggle('drawn-tile', drawn);
    node.classList.toggle('last-discard', lastDiscard);
    extraClasses.filter(Boolean).forEach((className) => node.classList.add(className));

    node.disabled = !clickable;
    if (!clickable) node.classList.add('display-tile');
    if (clickable && onClick) node.addEventListener('click', onClick);
    return node;
  }

  global.MahjongTileUI = Object.freeze({ createFace, createTile, tileName });
}(window));
