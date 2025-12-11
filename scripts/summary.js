const timelineContainer = document.getElementById('timeline');

const initSummary = async () => {
  if (!timelineContainer) return;

  try {
    const response = await fetch('manifest.json');
    if (!response.ok) throw new Error('타임라인을 불러오지 못했습니다.');

    const posts = await response.json();
    renderTimeline(posts);
  } catch (error) {
    timelineContainer.innerHTML = `<p class="muted">⚠️ ${error.message}</p>`;
  }
};

const renderTimeline = (posts = []) => {
  if (posts.length === 0) {
    timelineContainer.innerHTML = '<p class="muted">아직 발행된 글이 없습니다.</p>';
    return;
  }

  const groupedByYear = posts.reduce((acc, post) => {
    const date = new Date(post.date);
    const year = date.getFullYear();
    if (!acc[year]) acc[year] = {};
    if (!acc[year][post.date]) acc[year][post.date] = [];
    acc[year][post.date].push(post);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);
  timelineContainer.innerHTML = '';

  sortedYears.forEach((year) => {
    const yearBlock = document.createElement('section');
    yearBlock.className = 'timeline-year-block';
    yearBlock.innerHTML = `<h3 class="timeline-year">${year}</h3>`;

    const list = document.createElement('ul');
    list.className = 'timeline-list';

    const sortedDates = Object.keys(groupedByYear[year]).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    sortedDates.forEach((dateString) => {
      const postsOnDate = groupedByYear[year][dateString];
      const { day, month } = formatShortDate(dateString);

      const item = document.createElement('li');
      item.className = 'timeline-entry';
      item.innerHTML = `
        <div class="timeline-entry__date">
          <span class="timeline-entry__month">${month}</span>
          <span class="timeline-entry__day">${day}</span>
        </div>
        <div class="timeline-entry__content">
          <ul class="timeline-entry__titles">
            ${postsOnDate.map((post) => `<li>${post.title}</li>`).join('')}
          </ul>
        </div>
      `;

      list.appendChild(item);
    });

    yearBlock.appendChild(list);
    timelineContainer.appendChild(yearBlock);
  });
};

const formatShortDate = (value) => {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleDateString('ko-KR', { month: 'short' }).replace('.', '');
  return { day, month };
};

document.addEventListener('DOMContentLoaded', initSummary);
