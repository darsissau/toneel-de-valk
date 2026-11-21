# Overdracht: website Toneel De Valk

Stand van zaken op 21 november 2026. Live op https://toneeldevalk.be.

## In het kort

| Onderdeel | Wat |
|---|---|
| Framework | Astro 6, volledig statisch (`dist/`), Tailwind CSS 4 |
| Hosting | Netlify: bouwt automatisch bij elke push naar `main` |
| Beheer (CMS) | Decap CMS op `/admin`, login via Netlify Identity, schrijft via git-gateway rechtstreeks commits op `main` |
| Formulieren | Contactformulier via Netlify Forms (`data-netlify`), bedankpagina `/bedankt` |
| Tickets | Extern via Ticketgang (link per voorstelling + abonnement in Instellingen) |
| Foto's | `/fotos` haalt een Google Photos-album op via de Netlify-functie `netlify/functions/photos.js` (`/api/photos`) |
| Repo | github.com/darsissau/toneel-de-valk |

Belangrijk: de site is statisch. Alles wat van "vandaag" afhangt (volgende productie op de homepage, oude voorstellingen uit Google houden) wordt berekend **op het moment van de build**, niet bij elk bezoek. Zie [Aandachtspunten](#aandachtspunten-en-risicos).

## Lokaal werken

```sh
npm install
npm run dev          # site op http://localhost:4321
npm run build        # productiebuild in dist/
npm run preview      # dist/ lokaal bekijken
```

Het CMS lokaal testen (zonder Netlify-login), in twee terminals:

```sh
npm run cms-proxy    # lokale CMS-server op poort 8081 (local_backend: true in config.yml)
npm run dev          # daarna http://localhost:4321/admin
```

Lokaal opgeslagen wijzigingen komen rechtstreeks in je werkmap terecht, niet in git.

## Structuur

```
src/content/voorstellingen/*.md   één bestand per voorstelling (beheerd via CMS)
src/content/nieuws/*.md           nieuwsberichten
src/data/tickets.json             prijzen + links abonnement/losse tickets (CMS: Instellingen)
src/data/sponsors.json            sponsors voor /steun en footer (CMS: Instellingen)
src/content.config.ts             schema (velden) van de collecties
public/admin/config.yml           CMS-configuratie: moet in sync blijven met content.config.ts
src/pages/voorstellingen/[slug].astro        detailpagina voorstelling
src/pages/voorstellingen/[slug]/[qr].svg.ts  QR-codes (SVG), ook gebruikt door de PNG-variant
src/pages/voorstellingen/[slug]/[qr].png.ts  QR-codes (PNG, ~1200px)
src/pages/voorstellingen/[slug]/og.jpg.ts    deelbeeld 1200x630 voor WhatsApp/Facebook
src/pages/voorstellingen/[slug]/programma.astro  vaste link naar het programmaboekje
public/pdf/                       geüploade PDF's (programmaboekjes)
public/images/                    geüploade afbeeldingen
```

Een nieuw veld toevoegen aan een voorstelling = drie plaatsen: `content.config.ts` (schema), `public/admin/config.yml` (CMS-veld) en de pagina die het toont.

## Velden van een voorstelling

| Veld | Gebruik |
|---|---|
| `title`, `author`, `director`, `location`, `summary` | tekst op de pagina; `summary` is ook de tekst bij delen |
| `date` | tekst zoals "NOV 2026"; wordt **ook gebruikt om te sorteren** (zie aandachtspunten) |
| `schedule[].time` | speeldata, formaat `21 November 2026 - 20:00`; bepaalt of een voorstelling voorbij is |
| `image` | flyer (staand); bron voor het deelbeeld |
| `ticket_link`, `ticket_label` | ticketknop |
| `pdf`, `pdf_label` | programmaboekje: knop op de pagina + QR-code (nieuw, zie hieronder) |
| `support_label`, `support_partners` | logo's onderaan de pagina |

## Gebouwd op 21 november 2026

1. **Programmaboekje (PDF) per voorstelling.** Upload via het veld "PDF (bv. programmaboekje)" in het CMS; komt in `public/pdf/`. Op de pagina verschijnt een knop "Programmaboekje". Le Lavoir heeft er al een.
2. **Delen.** Rij icoonknoppen onder de ticketknop: WhatsApp, Facebook, X, LinkedIn, Telegram, Bluesky, e-mail, kopieer link, en op telefoons het eigen deelmenu van het toestel (Instagram, Messenger, sms, …). Iconen uit `simple-icons` (alleen bij de build); LinkedIn-icoon zelf getekend.
3. **Voorbeeldkaart bij delen.** Open Graph-tags in `Layout.astro` (titel, samenvatting, beeld). Per voorstelling wordt een apart deelbeeld van 1200x630 gemaakt (`og.jpg`): de volledige flyer op een vervaagde achtergrond, 30-75 KB. De originele flyers zijn 1,7-5,6 MB, te groot voor WhatsApp.
4. **QR-codes.** QR-icoon in de deelrij opent een popup met:
   - QR naar de voorstellingspagina;
   - QR naar het programmaboekje (alleen als er een PDF is). Die wijst naar de vaste link `/voorstellingen/<naam>/programma/`, die doorstuurt naar de huidige PDF. **Een gedrukte QR blijft dus werken als de PDF later vervangen wordt.**
   - Keuze wit of transparante achtergrond, download als SVG (drukwerk) of PNG.
   - Valklogo in het midden, puur zwart zoals de code; foutcorrectie niveau H houdt de code scanbaar.

5. **Speeldata in Google (structured data).** Elke voorstellingspagina bevat JSON-LD met één `schema.org/TheaterEvent` per regel in `schedule`: datum + uur in Belgische tijd (winter/zomeruur automatisch), Magdalenazaal met volledig adres (andere locatie: alleen de naam uit het CMS), ticketlink, prijs uit Instellingen > Tickets, flyer, regie en auteur. Regels die niet als `21 November 2026 - 20:00` te lezen zijn, worden overgeslagen. Gevalideerd met validator.schema.org (0 fouten). Google toont dit pas na opnieuw indexeren; controleren via Google Search Console > Verbeteringen > Evenementen of de Rich Results Test.

Getest: build, alle QR-codes gedecodeerd (lokaal en live), live tags opgevraagd als WhatsApp- en Facebook-crawler. **Niet getest:** de echte WhatsApp-app, gedrukte QR-codes met echte telefoons.

### Tip: oude deelvoorbeelden

WhatsApp en Facebook onthouden het voorbeeld van een link. Toont een link die al eerder gedeeld werd nog geen foto, dan is dat dat geheugen, niet de site:

- WhatsApp: geheugen zit op het toestel; een link met `?v=2` erachter wordt opnieuw opgehaald (getest, werkt).
- Facebook/Messenger: Facebook Sharing Debugger > "Scrape again".

## Aandachtspunten en risico's

Gerangschikt van belangrijk naar minder belangrijk.

1. **"Vandaag" wordt alleen bij een build berekend.** Netlify bouwt alleen bij een push. Na de laatste voorstelling van Le Lavoir (28 november) blijft de homepage-knop "Onze volgende productie" naar Le Lavoir wijzen en blijft de pagina in Google, tot iemand iets wijzigt. Oplossing: dagelijkse rebuild via een Netlify build hook (bv. GitHub Action met `schedule`), of de datumlogica in de browser doen.
2. **Sorteren op het tekstveld `date` is breekbaar.** De homepage en `/voorstellingen` lezen "NOV 2026" en "MAART 2027" als datum. Volledige Nederlandse maandnamen werken; "NOV" werkt alleen toevallig omdat JavaScript het als Engels herkent. "OKT 2026" of "SEPT 2026" geeft een ongeldige datum en een verkeerde volgorde. Beter: sorteren op de eerste datum uit `schedule`.
3. **Vier kopieën van dezelfde datumlogica**: `index.astro`, `voorstellingen/index.astro`, `voorstellingen/[slug].astro` en `astro.config.mjs` hebben elk hun eigen maand-parser. Samenvoegen in één helper bij de volgende aanpassing.
4. **Updates.** `npm audit` meldt kwetsbaarheden in `astro` (6.1.9, nieuwste is 7.x) en `sharp`. Omdat de site statisch is en sharp alleen bij de build draait, is het reële risico klein, maar plan een upgrade naar Astro 7 (major versie: build en pagina's nalopen). `netlify-cms-proxy-server` is alleen voor lokaal gebruik.
5. **Netlify Identity-script op elke pagina.** `Layout.astro` laadt het op alle pagina's (van unpkg.com), terwijl het alleen nodig is voor `/admin` en voor de uitnodigings- en wachtwoordlinks op de homepage. Kan beperkt worden tot de homepage en `/admin`: sneller en minder externe aanroepen.
6. **Google Fonts** wordt geladen van Google-servers (IP-adressen van bezoekers gaan naar Google). In de EU is zelf hosten de veilige keuze; de privacypagina vermeldt het niet.
7. **Foto's via Google Photos-scraping.** `photos.js` leest de HTML van een gedeeld album. Als Google die pagina verandert, blijft `/fotos` leeg. Er is één vast album (URL in de functie).
8. **Kleine dingen**
   - `/steun` staat niet in het menu of de footer (alleen bereikbaar via directe link).
   - De homepage berekent de 3 laatste nieuwsberichten maar toont ze nergens.
   - `README.md` is nog de standaardtekst van Astro.
   - PDF's komen in de git-repository; vraag om ze onder een paar MB te houden.
   - Op een telefoon passen de 9 deelknoppen niet op één rij (lopen netjes over op twee).

## Ideeën om verder uit te bouwen

### 1. Homepage: "Nu te zien" tijdens de speelperiode (aanbevolen eerst)

Wanneer een productie loopt of binnen enkele weken start, wordt de hero op de homepage een affiche van dat stuk in plaats van de algemene "Blijf verwonderd!":

- flyer + titel, "Nu te zien" (tijdens de speelweken) of "Binnenkort" (vooraf);
- de **eerstvolgende speeldatum** ("Volgende voorstelling: vrijdag 27 november, 20:00") en het aantal resterende voorstellingen;
- grote ticketknop, plus knop programmaboekje als er een PDF is;
- na de laatste voorstelling automatisch terug naar de gewone hero, of door naar de volgende productie.

Technisch: de speeldata als kleine JSON in de pagina meegeven en in de browser bepalen wat er getoond wordt. Dan klopt het elke dag zonder rebuild (lost meteen aandachtspunt 1 op voor de homepage). Ongeveer een halve tot een dag werk inclusief testen.

### 2. "Zet in je agenda"

Per speeldatum een `.ics`-bestand (Apple/Outlook) en een Google Agenda-link. Bij de build te genereren, net zoals de QR-codes.

### 3. Uitverkocht / laatste tickets per speeldatum

Een vinkje per regel in `schedule` in het CMS ("uitverkocht"), zichtbaar als label naast de datum. Voorkomt telefoontjes en mails. Kan meteen ook `availability: SoldOut` in de structured data zetten, zodat Google het toont.

### 4. Kleinere verbeteringen

- Speeldata die voorbij zijn grijs maken of wegdoen (zelfde browserlogica als idee 1).
- Nieuws terug op de homepage (wordt al berekend, zie aandachtspunt 8).
- Een vaste korte link per voorstelling voor op affiches, bv. `toneeldevalk.be/lavoir` (Netlify redirect, beheerbaar via een CMS-veld).
- Fotoalbum per voorstelling: een veld met een Google Photos-albumlink, getoond op de pagina van die voorstelling.
- Nieuwsbrief-inschrijving (Netlify Forms of Mailchimp), om bij een nieuwe productie iedereen te verwittigen.
- Bezoekersstatistieken zonder cookies (bv. Plausible of Netlify Analytics), zodat je ziet hoeveel mensen via QR-codes of WhatsApp binnenkomen.
