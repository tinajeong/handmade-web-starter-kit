// DOM 요소 참조
const listContainer = document.getElementById('post-list');
const viewer = document.getElementById('post-viewer');

// 1. 초기화: manifest.json을 가져와서 목록 생성
const init = async () => {
  try {
    const response = await fetch('manifest.json');
    if (!response.ok) throw new Error('목록을 불러오지 못했습니다.');
    
    const posts = await response.json();
    renderList(posts);

    // (선택사항) 첫 번째 글 자동 로드
    if (posts.length > 0) {
      loadPost(posts[0]);
    }
  } catch (error) {
    console.error(error);
    listContainer.innerHTML = '<li class="muted">글 목록을 불러올 수 없습니다.</li>';
  }
};

// 2. 글 목록 렌더링
const renderList = (posts) => {
  listContainer.innerHTML = ''; // 로딩 메시지 제거

  posts.forEach((post) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="post-date">${post.date}</span>
      <strong>${post.title}</strong>
      <p class="summary">${post.summary}</p>
    `;

    // 클릭 이벤트: 해당 포스트의 파일 경로로 데이터 요청
    li.addEventListener('click', () => {
      // 활성화 스타일 처리
      document.querySelectorAll('#post-list li').forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      
      // 글 내용 로드
      loadPost(post);
    });

    listContainer.appendChild(li);
  });
};

// 3. 개별 마크다운 파일 로드 및 렌더링
const loadPost = async (post) => {
  // 로딩 표시
  viewer.style.opacity = '0.5';
  
  try {
    const response = await fetch(post.file);
    if (!response.ok) throw new Error('글 내용을 불러오지 못했습니다.');
    
    const markdownText = await response.text();
    renderMarkdown(post, markdownText);
    
    // 모바일 스크롤 처리
    if (window.innerWidth < 768) {
        viewer.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    viewer.innerHTML = `<div class="placeholder-msg">⚠️ ${error.message}</div>`;
  } finally {
    viewer.style.opacity = '1';
  }
};

// 4. 마크다운 변환 및 하이라이팅 적용
const renderMarkdown = (post, markdownText) => {
  const htmlContent = marked.parse(markdownText);

  viewer.innerHTML = `
    <header class="post-header" style="margin-bottom: 2rem;">
      <p class="eyebrow">${post.date}</p>
      <h1 style="margin-top:0.5rem;">${post.title}</h1>
    </header>
    <div class="post-body">
      ${htmlContent}
    </div>
  `;

  // 코드 하이라이팅 적용
  viewer.querySelectorAll('pre code').forEach((el) => {
    hljs.highlightElement(el);
  });
};

// 앱 시작
document.addEventListener('DOMContentLoaded', init);