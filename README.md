# TheatreX – Rezervačný systém divadelných lístkov

Webová aplikácia pre rezerváciu divadelných lístkov. Backend: Spring Boot + H2. Frontend: React + TypeScript + Vite.

---

## Zmeny vykonané v backende (doplnené počas vývoja frontendu)

| Čo | Kde | Prečo |
|---|---|---|
| `GET /api/shows/{id}` | `ShowController` + `ShowService` | Chýbal endpoint pre detail jedného predstavenia |
| `GET /api/performances/{id}` | `PerformanceController` + `PerformanceService` | Chýbal endpoint pre detail jedného termínu |
| `POST /api/auth/login` | nový `AuthController` + `UserService` | Neexistoval žiadny login endpoint — frontend sa nemohol prihlásiť |
| `UserService.createUser` | `UserService` | Pri registrácii sa nenastavovala `role` ani `createdAt` → crash databázy |
| Kontrola duplicitného emailu | `UserService` | Registrácia s existujúcim emailom hodila DB chybu namiesto čitateľnej 409 odpovede |
| `@JsonProperty(WRITE_ONLY)` na `password` | `User.java` | Heslo sa vracalo v každej GET odpovedi — teraz sa iba číta (pri registrácii), nikdy neposiela späť |
| JSON formát chybových odpovedí | `ApiExceptionHandler` | Chyby sa vracali ako plain text → frontend ich nevedel parsovať; teraz `{"message":"..."}` |
| `NotFoundException` (HTTP 404) | nový `exception/NotFoundException` | Chýbal handler pre prípad keď záznam neexistuje |
| CORS konfigurácia | nový `config/CorsConfig` | Bez CORS by frontend (port 5173) nemohol volať backend (port 8080) priamo |
| Spring Security + vypnutý CSRF | `pom.xml` + nový `config/SecurityConfig` | `spring-boot-h2console` ťahal Spring Security tranzitívne → všetky POST requesty dostávali 403 Forbidden; CSRF je vypnutý (REST API je stateless) |

---

## Požiadavky

| Nástroj | Verzia |
|---|---|
| Java | 21+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Spustenie

### 1. Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

Backend beží na **http://localhost:8080**

H2 konzola (prehliadač databázy): **http://localhost:8080/h2-console**
- JDBC URL: `jdbc:h2:file:./data/theatredb`
- Username: `sa`
- Password: *(prázdne)*

---

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install       # len prvýkrát
npm run dev
```

Frontend beží na **http://localhost:5173**

> Vite automaticky presmeruje `/api/*` na backend (port 8080) — CORS nie je problém počas vývoja.

---

## Štruktúra projektu

```
theatre-ticket-system/
├── backend/                  Spring Boot aplikácia
│   └── src/main/java/com/theatre/backend/
│       ├── controller/       REST endpointy
│       ├── service/          Biznis logika
│       ├── repository/       JPA repozitáre
│       ├── entity/           JPA entity (DB tabuľky)
│       ├── dto/              Request/Response objekty
│       ├── exception/        Vlastné výnimky + handler
│       └── config/           CORS konfigurácia
└── frontend/                 React + TypeScript aplikácia
    └── src/
        ├── api/              API typy + fetch funkcie
        ├── context/          Globálny stav (auth, košík)
        ├── components/       Nav, Footer, AuthModals
        └── pages/            HomePage, ShowsPage, ShowDetailPage,
                              SeatMapPage, HowPage
```

---

## REST API – prehľad endpointov

### Shows (Predstavenia)
| Metóda | URL | Popis |
|---|---|---|
| GET | `/api/shows` | Zoznam všetkých predstavení |
| GET | `/api/shows/{id}` | Detail predstavenia |
| POST | `/api/shows` | Vytvoriť predstavenie |

### Performances (Termíny)
| Metóda | URL | Popis |
|---|---|---|
| GET | `/api/performances` | Všetky termíny |
| GET | `/api/performances/{id}` | Detail termínu |
| GET | `/api/performances/show/{showId}` | Termíny pre dané predstavenie |
| GET | `/api/performances/{id}/seats` | Mapa sedadiel s obsadenosťou |
| GET | `/api/performances/{id}/occupied-seats` | ID obsadených sedadiel |
| POST | `/api/performances` | Vytvoriť termín |

### Halls (Sály)
| Metóda | URL | Popis |
|---|---|---|
| GET | `/api/halls` | Zoznam sál |
| POST | `/api/halls` | Vytvoriť sálu |

### Seats (Sedadlá)
| Metóda | URL | Popis |
|---|---|---|
| GET | `/api/seats/hall/{hallId}` | Sedadlá danej sály |
| POST | `/api/seats` | Vytvoriť sedadlo |

### Reservations (Rezervácie)
| Metóda | URL | Popis |
|---|---|---|
| GET | `/api/reservations` | Všetky rezervácie |
| GET | `/api/reservations/{id}` | Detail rezervácie |
| POST | `/api/reservations` | Vytvoriť rezerváciu |
| DELETE | `/api/reservations/{id}/cancel` | Zrušiť rezerváciu |

### Users (Používatelia)
| Metóda | URL | Popis |
|---|---|---|
| GET | `/api/users` | Zoznam používateľov |
| POST | `/api/users` | Registrácia nového používateľa |
| GET | `/api/users/{id}/reservations` | Rezervácie používateľa |

### Auth (Prihlásenie)
| Metóda | URL | Popis |
|---|---|---|
| POST | `/api/auth/login` | Prihlásenie (email + heslo) |

---

## Testovanie API (príklady)

### Vytvoriť sálu
```bash
curl -X POST http://localhost:8080/api/halls \
  -H "Content-Type: application/json" \
  -d '{"name":"Hlavná sála","capacity":200}'
```

### Vytvoriť sedadlá pre sálu (id=1)
```bash
curl -X POST http://localhost:8080/api/seats \
  -H "Content-Type: application/json" \
  -d '{"rowNumber":1,"seatNumber":1,"price":10.0,"hall":{"id":1}}'
```

### Vytvoriť predstavenie
```bash
curl -X POST http://localhost:8080/api/shows \
  -H "Content-Type: application/json" \
  -d '{"title":"Hamlet","description":"Shakespearova tragédia.","genre":"Dráma","durationMinutes":150}'
```

### Vytvoriť termín (showId=1, hallId=1)
```bash
curl -X POST http://localhost:8080/api/performances \
  -H "Content-Type: application/json" \
  -d '{"startTime":"2026-04-15T19:00:00","status":"SCHEDULED","show":{"id":1},"hall":{"id":1}}'
```

### Registrovať používateľa
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ján Novák","email":"jan@example.com","password":"heslo123"}'
```

### Prihlásiť sa
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jan@example.com","password":"heslo123"}'
```

### Vytvoriť rezerváciu (hosť bez registrácie)
```bash
curl -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"performanceId":1,"seatIds":[1,2],"guestName":"Anna Kováčová","guestEmail":"anna@example.com"}'
```

### Vytvoriť rezerváciu (prihlásený používateľ)
```bash
curl -X POST http://localhost:8080/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"performanceId":1,"seatIds":[3],"userId":1}'
```

### Zrušiť rezerváciu
```bash
curl -X DELETE http://localhost:8080/api/reservations/1/cancel
```

---

## Chybové odpovede

Všetky chyby vracajú JSON:
```json
{"message": "Popis chyby"}
```

| HTTP kód | Popis |
|---|---|
| 400 | Neplatný request (chýbajúce pole, zlý formát, zlé heslo) |
| 404 | Záznam nebol nájdený |
| 409 | Konflikt (sedadlo už obsadené, email už existuje) |

---

## Používateľský tok

```
Domov → Prezerať predstavenia
       ↓
Zoznam predstavení (filter podľa žánru)
       ↓
Detail predstavenia → výber termínu (dátum/čas)
       ↓
Mapa sály → kliknutím vybrať sedadlá
       ↓
Zadať meno + email (alebo prihlásiť sa)
       ↓
Potvrdiť → zobrazí sa číslo rezervácie
```

---

## Poznámky k bezpečnosti

- Heslá sú uložené ako **plain text** — pre produkciu nutné pridať BCrypt hashing
- Autentifikácia je bez JWT tokenov — pre produkciu implementovať Spring Security + JWT
