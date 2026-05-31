# Open Maintainer Workbench

Codex 오픈소스 지원 프로그램 신청을 위해 만든 오픈소스 메인테이너 작업대 데모입니다. 메인테이너가 GitHub 저장소 URL만 입력하면 이슈 분류, PR 리뷰 체크리스트, 릴리스 노트 초안, README 개선안, CONTRIBUTING.md 초안, good first issue 추천, 주간 리포트, 신청용 요약을 바로 얻을 수 있습니다.

![Open Maintainer Workbench screenshot](./screenshots/maintainer-workbench.png)

## 핵심 기능

- 이슈 자동 분류: `bug`, `feature`, `question`, `docs`
- PR 리뷰 체크리스트 생성
- 릴리스 노트 초안 생성
- README 개선안 생성
- CONTRIBUTING.md 초안 생성
- good first issue 추천
- 메인테이너 주간 리포트 생성
- Codex 지원 프로그램 신청용 요약 생성
- GitHub API 없이 예시 데이터로 즉시 실행
- 향후 GitHub API 연결을 위한 provider 구조 포함

## 실행

정적 파일만으로 실행됩니다.

```bash
npm test
npm run check
```

ES module import를 사용하므로 정적 서버 또는 Netlify 같은 호스팅 환경에서 실행하세요.

```bash
python3 -m http.server 4173
```

## 구조

```text
.
├── app.js
├── index.html
├── styles.css
├── src
│   ├── analyzer.js
│   ├── sample-data.js
│   └── providers
│       ├── github-provider.js
│       └── sample-provider.js
├── tests
│   └── analyzer.test.mjs
├── docs
│   ├── codex-application-copy.md
│   └── codex-application-summary.md
├── screenshots
│   └── maintainer-workbench.png
├── LICENSE
├── netlify.toml
└── package.json
```

## GitHub API 확장 포인트

현재 앱은 `src/providers/sample-provider.js`에서 예시 데이터를 가져옵니다. 실제 GitHub API를 연결할 때는 `src/providers/github-provider.js`의 `getRepositorySnapshotFromGitHub()`가 GitHub Issues, Pull Requests, Releases 응답을 앱 내부 snapshot 형식으로 변환하면 됩니다. UI와 분석 로직은 provider에 의존하지 않도록 분리되어 있어 Codex/API 기반 분석으로 확장하기 쉽습니다.

## Netlify 배포

이 저장소 루트를 Netlify에 업로드하거나 제공된 ZIP 파일을 드래그 앤 드롭하면 됩니다. 별도 빌드 명령은 필요하지 않습니다.

## 라이선스

MIT License
