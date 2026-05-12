@AGENTS.md

# MyKHome — Project Context

## What This Is
외국인을 위한 한국 부동산 플랫폼. 외국인 세입자는 영어로 매물을 검색하고 에이전트에게 문의하고, 한국인 에이전트는 한국어로 매물을 관리한다. 양방향 번역은 DeepL API가 자동 처리한다.

---

## Tech Stack

| 레이어 | 기술 |
|--------|------|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database + Auth | Supabase (Postgres + RLS + Auth) |
| Translation | DeepL API (Free tier) |
| Storage | Supabase Storage (`listing-images` bucket) |
| Map | Google Maps JavaScript API |
| Deployment | — |

---

## Directory Structure

```
src/
├── app/
│   ├── page.tsx                     # 홈 (서버 컴포넌트, 매물 fetch)
│   ├── layout.tsx
│   ├── globals.css
│   ├── login/page.tsx               # 로그인/회원가입
│   ├── agent/page.tsx               # 에이전트 대시보드 (서버)
│   ├── listings/[id]/page.tsx       # 매물 상세 (서버)
│   └── api/
│       ├── auth/callback/route.ts   # Supabase OAuth 콜백
│       ├── listings/
│       │   ├── route.ts             # GET (전체), POST (등록)
│       │   └── [id]/route.ts        # GET (단건), PATCH (수정), DELETE (삭제)
│       ├── messages/
│       │   ├── route.ts             # GET (에이전트용), POST (문의 전송)
│       │   └── [id]/reply/route.ts  # POST (에이전트 답장)
│       └── translate/route.ts       # POST (번역 유틸)
├── components/
│   ├── shared/
│   │   ├── Hero.tsx                 # 구글맵 배경 히어로 섹션 (클라이언트)
│   │   ├── Navbar.tsx               # 서버 컴포넌트 래퍼
│   │   └── NavbarClient.tsx         # 로그인 상태별 네브 (클라이언트)
│   ├── home/
│   │   └── HomeContent.tsx          # 필터바 + 매물 그리드 (클라이언트)
│   ├── listings/
│   │   ├── ListingCard.tsx
│   │   ├── ListingGrid.tsx
│   │   ├── ListingGallery.tsx
│   │   ├── ContactForm.tsx
│   │   └── ContactModal.tsx
│   ├── agent/
│   │   ├── AgentDashboard.tsx       # 탭 레이아웃 (클라이언트)
│   │   ├── AgentListings.tsx        # 매물 목록 + 수정/삭제 (클라이언트)
│   │   ├── AgentEditListing.tsx     # 수정 모달 (클라이언트)
│   │   ├── AgentNewListing.tsx      # 등록 폼 (클라이언트)
│   │   └── AgentMessages.tsx        # 문의 목록 + 답장 (클라이언트)
│   └── ui/
│       ├── Button.tsx               # variant: primary | secondary | ghost
│       └── Input.tsx
├── lib/
│   ├── deepl.ts                     # translateToEnglish / translateToKorean
│   ├── utils.ts                     # cn(), formatPrice() (만원/억원 포맷)
│   └── supabase/
│       ├── client.ts                # 브라우저용 createClient
│       ├── server.ts                # RSC/Route Handler용 createClient
│       └── middleware.ts            # updateSession (proxy.ts에서 사용)
├── proxy.ts                         # Next.js 16 미들웨어 (middleware.ts 대체)
└── types/index.ts                   # 공유 타입 정의
```

---

## Database Schema

### `public.users`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | auth.users 참조 |
| email | text | |
| role | text | `'user'` \| `'agent'` |
| name | text | |
| created_at | timestamptz | |

### `public.agents`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| user_id | uuid FK → users | unique |
| company | text | |
| phone | text | |
| district | text | |

### `public.listings`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| agent_id | uuid FK → agents | |
| title_kr | text | 한국어 제목 (에이전트 입력) |
| title_en | text | 영어 제목 (DeepL 자동 번역) |
| type | text | `'월세'` \| `'전세'` \| `'매매'` |
| price | integer | 만원 단위 |
| deposit | integer | 보증금, 만원 단위 |
| size | numeric(6,2) | ㎡ |
| district | text | 지역구 |
| subway_station | text | |
| subway_minutes | integer | |
| contract | text | `'단기'` \| `'장기'` |
| duration | integer | 개월 수 |
| status | text | `'active'` \| `'inactive'` |
| image_urls | text[] | Supabase Storage 공개 URL 배열 |
| created_at | timestamptz | |

### `public.messages`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid PK | |
| listing_id | uuid FK → listings | |
| sender_name | text | 외국인 세입자 이름 |
| sender_contact | text | 이메일/전화 |
| content_en | text | 원문 영어 메시지 |
| content_kr | text | DeepL 번역 (에이전트용) |
| reply_kr | text? | 에이전트 한국어 답장 |
| reply_en | text? | DeepL 번역 (세입자용) |
| is_read | boolean | |
| created_at | timestamptz | |

### RLS 요약
- `users`: 본인 행만 읽기/수정
- `agents`: 전체 읽기, 본인만 수정
- `listings`: active 매물 전체 읽기, 에이전트는 본인 매물 전체 관리
- `messages`: 누구나 INSERT, 에이전트는 본인 매물 문의만 읽기/수정

### 트리거
`on_auth_user_created`: 회원가입 시 `users` 자동 생성, role=agent이면 `agents`도 자동 생성

---

## Translation Flow

```
[에이전트 한국어 입력]
        ↓ POST /api/listings
   DeepL → title_en 저장
        ↓
[외국인: 영어로 표시]

[외국인 영어 문의 전송]
        ↓ POST /api/messages
   DeepL → content_kr 저장
        ↓
[에이전트: 한국어로 문의 확인]
        ↓
[에이전트 한국어 답장]
        ↓ POST /api/messages/[id]/reply
   DeepL → reply_en 저장
        ↓
[외국인: 영어 답장 수신]
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # API Route에서 사용

# Translation
DEEPL_API_KEY=                       # 서버 전용 (NEXT_PUBLIC 아님)

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=    # Hero 지도 표시용
```

---

## Key Gotchas

**1. Next.js 16 미들웨어**
`middleware.ts` 대신 `src/proxy.ts` 사용. 이름이 다르므로 인증 보호 로직 수정 시 반드시 `proxy.ts`를 수정할 것.

**2. 클라이언트 컴포넌트에서 createClient 호출 위치**
`@supabase/ssr`의 `createClient()`를 클라이언트 컴포넌트 렌더 레벨에서 호출하면 SSR 빌드 실패. 반드시 이벤트 핸들러 또는 `useEffect` 내부에서만 호출할 것.

**3. 서버 컴포넌트에서 createClient**
`src/lib/supabase/server.ts`의 `createClient`는 `async` 함수임. `await createClient()`로 호출해야 함.

**4. listings 스키마에 image_urls 컬럼**
`supabase/schema.sql`에 `image_urls text[]` 컬럼이 없음 — 나중에 ALTER로 추가된 것으로 보임. 새 환경 세팅 시 수동으로 추가 필요:
```sql
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';
```

**5. formatPrice 유틸**
`src/lib/utils.ts`의 `formatPrice(value: number)`: 만원 단위 정수를 받아 "1억 5,000만원" 형식으로 반환. 가격 표시 시 항상 이 함수 사용.

**6. Google Maps 스타일**
지도 스타일(dark navy)은 `src/components/shared/Hero.tsx`의 `MAP_STYLES` 배열에 정의. `mapId` 없이 `styles` 배열 방식 사용 중이므로 `AdvancedMarkerElement`는 사용 불가 — 마커는 SVG data URL 방식으로 구현.

---

## UI 언어 규칙

- `/` (홈, 매물 상세, 문의): 영어 — 외국인 세입자 대상
- `/agent` (대시보드): 한국어 — 한국인 에이전트 대상
- `/login`: 영어

---

## 앞으로 할 것들

- [ ] 세입자 회원가입/로그인 (현재 에이전트만 가입 가능)
- [ ] 매물 상세 페이지 번역 개선 (description 필드 추가)
- [ ] 문의 목록에서 읽음 처리 자동화 (현재 수동)
- [ ] 매물 필터 — 가격 범위 슬라이더 추가
- [ ] 구글맵 핀 클릭 시 해당 매물 상세로 이동
- [ ] 이미지 압축/리사이즈 전처리 (현재 원본 업로드)
- [ ] 에이전트 프로필 편집 (회사명, 전화번호, 담당 지역)
- [ ] DeepL API 키 실제 키로 교체 (현재 placeholder)
