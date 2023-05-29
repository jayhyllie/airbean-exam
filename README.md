# airbean-exam
Node.js Exam -- Fabulous Dolphins


# Grupparbete Airbean API

## Instruktioner

I detta grupparbete ska ni skapa ett API för en webbapp där det går att beställa kaffe och 
få den levererad via drönare (drönare ingår ej i uppgiften).

### User stories
En gruppmedlem gör ett repo och bjuder in resterande gruppmedlemmar till det repot. Sedan under fliken **Projects** så välj ett nytt projekt och sätt upp enligt strukturen nedan samt kopiera över alla user stories. Ni får även använda Trello och skapa upp fler stories eller tasks (som kan vara mer tekniska). I detta grupparbete kan det vara till fördel att skapa upp lite fler tasks att koppla till en user story som mer beskriver det som behövs göras i backend för att uppnå funktionaliteten i user storyn.

https://github.com/users/zocom-christoffer-wallenberg/projects/14/views/1 (Uppdaterad länk!)

## Figmaskiss

**Ingen frontend ska göras i någon av examinationerna!**

Använd dock gärna denna skiss för att förstå vad som förväntas skickas tillbaka av api:et och hur det ska presenteras för användaren.

Skiss: https://www.figma.com/file/UeUGVefSdgio0sRxPFccJI/AirBean-v.1.1?type=design&node-id=0-1&t=y5w4C5vqiulVg5VS-0

## Arbetsgång

1. Läs igenom alla user stories och försök bestämma vad för api endpoints ni behöver.
2. Diskutera hur er datamodell ska se ut (alltså vad behöver ni spara i databasen) och vad för data ska ni skicka tillbaka. Använd följande frågor som hjälp:
    - Vad är databasen till för? Vad är dess syfte?
        
    - Vad vill vi spara för data?
        
    - Vad är det för typ av data vi vill spara? Hur ska den se ut? (Arrayer, nummer, strängar, booleans)
3. Dela upp arbete.

### Betygskriterier

**För Godkänt:**
* Uppfyller alla krav av funktionalitet.
* Använder sig av Express och NeDB som databas (en annan databas exempelvis MongoDB är okej ifall alla i gruppen är överens om detta).
* All input som skickas i url eller i body ska valideras i en middleware och ifall det är fel data ska ett felmeddelande skickas tillbaka.
* Det ska enbart gå att lägga till produkter som finns i menyn, ifall någon annan produkt skickas med så ska ett felmeddelande skickas tillbaka. Även pris ska kontrolleras, allt detta ska göras i en middleware.
* När ett konto skapas ska detta kopplas till ett slumpat användarid (här används fördelaktigt ett bibliotek) där användarid:et sedan kan användas för att hämta orderhistorik, användarnamn ska alltså ej skickas med i url för att hämta orderhistorik.

**För Väl Godkänt:**
* Allt i godkänt
* Kunna se pågående beställningar och tidigare beställningar (man kollar när beställningen lades (klockslag) gentemot vad klockan är nu. Här är det godkänt att använda något bibliotek för datum och tidshantering (ex. `moment.js` eller `date-fns`).

## Handledning

Handledning bokas via calendly, länk kommer snart

### Inlämning
Inlämning sker på Awesomo med en länk till ert Github repo med er kod senast **4/6 23:59**.
