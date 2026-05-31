let parkingData = [];

async function loadParkingData() {
  try {
    const response = await fetch('data/parking.json');
    if (!response.ok) throw new Error('无法读取 parking.json');
    parkingData = await response.json();
    initAreaFilter(parkingData);
    renderParking(parkingData);
    updateStats(parkingData);
  } catch (error) {
    document.getElementById('parkingList').innerHTML =
      '<p class="desc">车位数据加载失败，请检查 data/parking.json 文件。</p>';
    console.error(error);
  }
}

function initAreaFilter(data) {
  const select = document.getElementById('areaFilter');
  const areas = [...new Set(data.map(item => item.area))];
  areas.forEach(area => {
    const option = document.createElement('option');
    option.value = area;
    option.textContent = area;
    select.appendChild(option);
  });
}

function statusClass(status) {
  return status === '紧张' ? 'tight' : '';
}

function renderParking(data) {
  const list = document.getElementById('parkingList');
  if (!data.length) {
    list.innerHTML = '<p class="desc">暂无符合条件的车位。</p>';
    return;
  }

  list.innerHTML = data.map(item => `
    <article class="parking-card">
      <div class="card-top">
        <div>
          <h3>${item.name}</h3>
          <div class="meta">
            <span class="pill">${item.area}</span>
            <span class="pill">${item.type}</span>
            <span class="pill">${item.security}</span>
          </div>
        </div>
        <span class="status ${statusClass(item.status)}">${item.status}</span>
      </div>
      <div class="price">¥${item.monthlyPrice}/月起</div>
      <p class="desc">剩余车位：${item.availableSpaces} 个</p>
      <p class="desc">适合：${item.suitableFor}</p>
      <p class="desc">${item.description}</p>
      <div class="feature-list">${(item.features || []).map(f => `<span>${f}</span>`).join('')}</div>
      <div class="card-actions">
        <a class="consult" href="#contact">咨询这个车位</a>
        <a class="outline" href="tel:13800000000">电话咨询</a>
      </div>
    </article>
  `).join('');
}

function updateStats(data) {
  document.getElementById('parkingCount').textContent = data.length;
  document.getElementById('spaceCount').textContent =
    data.reduce((sum, item) => sum + Number(item.availableSpaces || 0), 0);
  document.getElementById('areaCount').textContent =
    new Set(data.map(item => item.area)).size;
  document.getElementById('minPrice').textContent =
    data.length ? `¥${Math.min(...data.map(item => Number(item.monthlyPrice)))}` : '¥0';
}

function applyFilters() {
  const area = document.getElementById('areaFilter').value;
  const price = document.getElementById('priceFilter').value;
  const keyword = document.getElementById('searchInput').value.trim();
  const availableOnly = document.getElementById('availableOnly').checked;

  const filtered = parkingData.filter(item => {
    const matchArea = area === 'all' || item.area === area;
    const matchPrice = price === 'all' || Number(item.monthlyPrice) <= Number(price);
    const matchAvailable = !availableOnly || item.status !== '已满';
    const matchKeyword =
      !keyword ||
      item.name.includes(keyword) ||
      item.area.includes(keyword) ||
      item.type.includes(keyword) ||
      item.suitableFor.includes(keyword);
    return matchArea && matchPrice && matchAvailable && matchKeyword;
  });

  renderParking(filtered);
  updateStats(filtered);
}

function getValue(id) {
  return document.getElementById(id).value || '未填写';
}

function copyDemandInfo() {
  const text = `停车需求：\n姓名：${getValue('leadName')}\n手机号：${getValue('leadPhone')}\n微信号：${getValue('leadWechat')}\n停车区域：${getValue('leadArea')}\n车型：${getValue('leadCar')}\n停放时长：${getValue('leadDuration')}\n预算范围：${getValue('leadBudget')}\n备注：${getValue('leadNote')}`;
  navigator.clipboard.writeText(text).then(() => alert('已复制需求信息，可以发送给微信客服。'));
}

function copyWechat() {
  navigator.clipboard.writeText(document.getElementById('wechatId').textContent).then(() => alert('微信号已复制'));
}

document.getElementById('areaFilter').addEventListener('change', applyFilters);
document.getElementById('priceFilter').addEventListener('change', applyFilters);
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('availableOnly').addEventListener('change', applyFilters);
document.getElementById('copyDemandBtn').addEventListener('click', copyDemandInfo);
document.getElementById('copyWechat').addEventListener('click', copyWechat);

loadParkingData();
