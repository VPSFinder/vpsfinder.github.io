/**
 * VPSFinder (寻机匠) 智能筛选雷达交互核心脚本
 */

let activeFilters = {
  line: 'all',
  price: 'all',
  pay: 'all'
};

function setVPSFilter(type, value, btnEl) {
  activeFilters[type] = value;
  
  // 更新该行内所有按钮状态
  const parent = btnEl.closest('.filter-chips');
  if (parent) {
    parent.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.remove('active');
    });
    btnEl.classList.add('active');
  }

  // 自定义筛选时清除预设高亮
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  
  filterVPSProviders();
}

function applyVPSPreset(presetKey, btnEl) {
  const isAlreadyActive = btnEl.classList.contains('active');
  
  // 重置所有筛选与预设按钮
  resetAllVPSFilters();

  if (isAlreadyActive) {
    // 再次点击取消预设，回到全量
    return;
  }

  btnEl.classList.add('active');

  if (presetKey === 'budget-annual') {
    activeFilters.price = 'budget-annual';
    syncChipActive('filter-price', 'budget-annual');
  } else if (presetKey === 'cn2') {
    activeFilters.line = 'cn2';
    syncChipActive('filter-line', 'cn2');
  } else if (presetKey === '9929') {
    activeFilters.line = '9929';
    syncChipActive('filter-line', '9929');
  } else if (presetKey === 'isp') {
    activeFilters.line = 'isp';
    syncChipActive('filter-line', 'isp');
  } else if (presetKey === 'alipay') {
    activeFilters.pay = 'alipay';
    syncChipActive('filter-pay', 'alipay');
  }

  filterVPSProviders();
}

function syncChipActive(containerId, filterValue) {
  const container = document.getElementById(containerId);
  if (container) {
    container.querySelectorAll('.filter-chip').forEach(chip => {
      if (chip.getAttribute('data-filter') === filterValue) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }
}

function filterVPSProviders() {
  const searchInput = document.getElementById('vps-search-input');
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const cards = document.querySelectorAll('.vps-provider-grid .vps-provider-card');
  const rows = document.querySelectorAll('.vps-provider-table-wrap .vps-provider-row');
  const counterEl = document.getElementById('matched-count');
  
  let matchCount = 0;

  // 1. 过滤卡片视图
  cards.forEach(card => {
    const isMatch = checkItemMatch(card, query);
    card.style.display = isMatch ? 'flex' : 'none';
    if (isMatch) matchCount++;
  });

  // 2. 过滤表格视图
  rows.forEach(row => {
    const isMatch = checkItemMatch(row, query);
    row.style.display = isMatch ? '' : 'none';
  });

  if (counterEl) {
    counterEl.textContent = matchCount;
  }
}

function checkItemMatch(el, query) {
  const lines = (el.getAttribute('data-lines') || '').split(' ');
  const prices = (el.getAttribute('data-price') || '').split(' ');
  const pay = (el.getAttribute('data-pay') || '').split(' ');
  const searchText = (el.getAttribute('data-searchtext') || '').toLowerCase();
  
  // 线路筛选
  let lineMatch = (activeFilters.line === 'all') || lines.includes(activeFilters.line);
  
  // 预算筛选（一个商家可同时属于多个档位）
  let priceMatch = (activeFilters.price === 'all') || prices.includes(activeFilters.price);
  
  // 支付方式筛选
  let payMatch = (activeFilters.pay === 'all') || pay.includes(activeFilters.pay);
  
  // 关键词搜索
  let searchMatch = true;
  if (query) {
    searchMatch = searchText.includes(query);
  }
  
  return lineMatch && priceMatch && payMatch && searchMatch;
}

function switchVPSView(viewMode) {
  const gridContainer = document.getElementById('vps-provider-grid');
  const tableContainer = document.getElementById('vps-provider-table-wrap');
  const btnGrid = document.getElementById('btn-view-grid');
  const btnTable = document.getElementById('btn-view-table');

  if (viewMode === 'table') {
    if (gridContainer) gridContainer.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'block';
    if (btnGrid) btnGrid.classList.remove('active');
    if (btnTable) btnTable.classList.add('active');
  } else {
    if (gridContainer) gridContainer.style.display = 'grid';
    if (tableContainer) tableContainer.style.display = 'none';
    if (btnGrid) btnGrid.classList.add('active');
    if (btnTable) btnTable.classList.remove('active');
  }

  try {
    localStorage.setItem('vps_radar_view', viewMode);
  } catch (e) {}
}

function clearVPSSearch() {
  const searchInput = document.getElementById('vps-search-input');
  if (searchInput) {
    searchInput.value = '';
    filterVPSProviders();
  }
}

function resetAllVPSFilters() {
  activeFilters = { line: 'all', price: 'all', pay: 'all' };
  
  document.querySelectorAll('.filter-chip').forEach(chip => {
    if (chip.getAttribute('data-filter') === 'all') {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.classList.remove('active');
  });
  
  clearVPSSearch();
}

function checkHashFocus() {
  if (window.location.hash === '#vps-interactive-filter') {
    const input = document.getElementById('vps-search-input');
    if (input) {
      setTimeout(() => {
        input.focus({ preventScroll: true });
      }, 400);
    }
  }
}

// 页面加载完成后挂载
document.addEventListener('DOMContentLoaded', () => {
  try {
    const savedView = localStorage.getItem('vps_radar_view');
    if (savedView === 'table') {
      switchVPSView('table');
    }
  } catch (e) {}

  filterVPSProviders();
  checkHashFocus();
});

window.addEventListener('hashchange', () => {
  checkHashFocus();
});

/**
 * 现代轻量无弹窗复制测速 IP
 */
window.copyVpsIp = function(btnEl, ip) {
  if (!navigator.clipboard) {
    const tempInput = document.createElement('input');
    tempInput.value = ip;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
  } else {
    navigator.clipboard.writeText(ip);
  }

  // 原地按钮视觉反馈
  const originalHtml = btnEl.innerHTML;
  btnEl.classList.add('ip-copied');
  btnEl.innerHTML = `<span class="copy-check">✓</span> <span>已复制: ${ip}</span>`;

  showVpsToast(`已成功复制测试 IP: ${ip}`);

  setTimeout(() => {
    btnEl.classList.remove('ip-copied');
    btnEl.innerHTML = originalHtml;
  }, 1800);
};

function showVpsToast(msg) {
  let toast = document.getElementById('vps-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vps-global-toast';
    toast.className = 'vps-global-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  
  clearTimeout(window.__vpsToastTimer);
  window.__vpsToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

/**
 * 顶部导航栏移动端展开/收起
 */
window.toggleMobileNav = function() {
  const menu = document.getElementById('navbarMenu');
  if (menu) {
    menu.classList.toggle('open');
  }
};

