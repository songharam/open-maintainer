# Open Maintainer Workbench

[![CI](https://github.com/songharam/open-maintainer/actions/workflows/ci.yml/badge.svg)](https://github.com/songharam/open-maintainer/actions/workflows/ci.yml)

Codex 오픈소스 지원 프로그램 신청을 위해 만든 오픈소스 메인테이너 작업대 데모입니다. 메인테이너가 GitHub 저장소 URL만 입력하면 이슈 분류, PR 리뷰 체크리스트, 릴리스 노트 초안, README 개선안, CONTRIBUTING.md 초안, good first issue 추천, 주간 리포트, 신청용 요약을 바로 얻을 수 있습니다.

![Open Maintainer Workbench screenshot](./screenshots/maintainer-workbench.png)

## Demo

- Netlify 배포: `maintainer-workbench-netlify.zip`을 Netlify에 업로드하면 바로 실행됩니다.
- GitHub Pages 선택 배포: 저장소 Settings에서 Pages source를 GitHub Actions로 설정한 뒤 `Deploy GitHub Pages` workflow를 수동 실행하세요.

## 핵심 기능

- 이슈 자동 분류: `bug`, `feature`, `question`, `docs`
- PR 리뷰 체크리스트 생성
- 이번 주 우선순위 브리프 생성
- 릴리스 노트 초안 생성
- README 개선안 생성
- CONTRIBUTING.md 초안 생성
- good first issue 추천
- 메인테이너 주간 리포트 생성
- Codex 지원 프로그램 신청용 요약 생성
- 전체 산출물 Markdown 복사 및 다운로드
- GitHub API 없이 예시 데이터로 즉시 실행
- 향후 GitHub API 연결을 위한 provider 구조 포함

## 저장소 운영

- CI: GitHub Actions에서 `npm test`와 `npm run check` 실행
- 이슈 템플릿: bug, feature, docs, question 분리
- PR 템플릿: maintainer impact와 validation 체크
- 기여 가이드: [CONTRIBUTING.md](./CONTRIBUTING.md)
- 보안 정책: [SECURITY.md](./SECURITY.md)
- 데모 진행 가이드: [docs/demo-script.md](./docs/demo-script.md)
- 로드맵: [docs/roadmap.md](./docs/roadmap.md)
- 아키텍처: [docs/architecture.md](./docs/architecture.md)
- GitHub API 연결 계획: [docs/github-api-integration.md](./docs/github-api-integration.md)

## 실행

정적 파일만으로 실행됩니다.

```bash
npm test
npm run check
```

ES module import를 사용하므로 정적 서버 또는 Netlify 같은 호스팅 환경에서 실행하세요.

```bash
npm ci
npm test
npm run check
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
├── .github
│   ├── ISSUE_TEMPLATE
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/ci.yml
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── screenshots
│   └── maintainer-workbench.png
├── SECURITY.md
├── SUPPORT.md
├── LICENSE
├── netlify.toml
└── package.json
```

## GitHub API 확장 포인트

현재 앱은 `src/providers/sample-provider.js`에서 예시 데이터를 가져옵니다. 실제 GitHub API를 연결할 때는 `src/providers/github-provider.js`의 `getRepositorySnapshotFromGitHub()`가 GitHub Issues, Pull Requests, Releases 응답을 앱 내부 snapshot 형식으로 변환하면 됩니다. UI와 분석 로직은 provider에 의존하지 않도록 분리되어 있어 Codex/API 기반 분석으로 확장하기 쉽습니다.

## Netlify 배포

이 저장소 루트를 Netlify에 업로드하거나 제공된 ZIP 파일을 드래그 앤 드롭하면 됩니다. 별도 빌드 명령은 필요하지 않습니다.

## GitHub Pages 배포

GitHub Pages workflow는 저장소 Pages 설정이 활성화된 뒤 수동으로 실행합니다.

1. GitHub 저장소에서 `Settings` -> `Pages`로 이동합니다.
2. Build and deployment source를 `GitHub Actions`로 설정합니다.
3. `Actions` -> `Deploy GitHub Pages` -> `Run workflow`를 실행합니다.
4. 배포가 완료되면 GitHub Pages URL이 workflow summary에 표시됩니다.

## 라이선스

MIT License
