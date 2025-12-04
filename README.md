# ✍️ Handmade Web Starter Kit

Marked.js와 Highlight.js를 활용하여 직접 만든 간단한 블로그/정적 웹사이트 스타터 키트입니다. 데이터, 콘텐츠, 로직을 분리하여 유지보수 및 확장이 용이하도록 설계되었습니다.

## ✨ 주요 기능

-   **마크다운 기반 콘텐츠**: 모든 게시글은 마크다운 파일로 작성되어 관리하기 쉽습니다.
-   **동적 글 로딩**: `Fetch API`를 사용하여 `manifest.json` 파일에서 글 목록을 가져오고, 선택된 마크다운 파일을 비동기적으로 로드합니다.
-   **코드 하이라이팅**: `Highlight.js`를 통해 코드 블록에 자동으로 구문 강조를 적용합니다.
-   **간결한 구조**: HTML, CSS, JavaScript가 명확히 분리되어 있으며, 게시글은 별도의 `posts` 디렉토리에 저장됩니다.
-   **유지보수 용이성**: 새 글을 추가하거나 기존 글을 수정할 때 JavaScript나 HTML 파일을 직접 수정할 필요 없이 `manifest.json`과 `.md` 파일만 변경하면 됩니다.

## 📁 파일 구조

```text
root/
├── index.html       (메인 레이아웃)
├── styles.css       (글로벌 스타일)
├── manifest.json    (글 목록 메타데이터)
├── scripts/
│   └── app.js       (글 로딩 및 렌더링 로직)
└── posts/           (마크다운 게시글 저장소)
    ├── sample.md
    └── sample-2.md
```

## 🚀 시작하기

이 프로젝트는 브라우저의 [CORS(Cross-Origin Resource Sharing) 정책](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS) 때문에 `file://` 프로토콜로 직접 HTML 파일을 열면 작동하지 않을 수 있습니다. 반드시 **로컬 웹 서버**를 통해 실행해야 합니다.

### 1. VS Code 사용 시 (권장)

1.  VS Code 확장 프로그램 탭에서 **"Live Server"**를 검색하여 설치합니다.
2.  `index.html` 파일에서 마우스 우클릭 후 **"Open with Live Server"**를 클릭합니다.

### 2. 터미널 (Python) 사용 시

1.  프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다:
    ```bash
    python -m http.server
    ```
2.  웹 브라우저에서 `http://localhost:8000`으로 접속합니다.

## 📝 새 글 추가하기

새로운 게시글을 추가하는 방법은 매우 간단합니다.

1.  `posts` 디렉토리 안에 새로운 마크다운 파일(`.md`)을 생성하고 글 내용을 작성합니다. (예: `posts/my-new-post.md`)
    *주의*: 마크다운 파일에는 **글의 본문 내용만** 포함하고, `<h1>` 태그(최상위 제목)는 사용하지 마세요. 제목은 `manifest.json`에서 관리됩니다.

2.  `manifest.json` 파일을 열고, 새 글에 대한 메타데이터 객체를 배열에 추가합니다.
    ```json
    {
      "id": 3, // 고유한 ID
      "title": "새로운 글의 제목",
      "date": "2024-07-01",
      "file": "posts/my-new-post.md", // 위에서 만든 마크다운 파일 경로
      "summary": "새 글의 간략한 요약입니다."
    }
    ```

3.  웹 서버를 새로고침하면 새 글이 목록에 표시됩니다.

## 🛠️ 사용된 기술

-   **[Marked.js](https://marked.js.org/)**: 마크다운 텍스트를 HTML로 변환합니다.
-   **[Highlight.js](https://highlightjs.org/)**: 코드 블록의 구문 강조를 처리합니다.
-   **Native Fetch API**: 비동기 데이터 로드를 위해 사용됩니다.

## 🤝 기여

버그 보고, 기능 제안 또는 코드 기여는 언제든지 환영합니다. GitHub 저장소에 이슈를 생성하거나 Pull Request를 보내주세요.

---