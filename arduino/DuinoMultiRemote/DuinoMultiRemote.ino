//------------------------------------------------------------//
// Arduino's sketch for S.A.R.A.H's plugin "DuinoMultiRemote" //
//------------------------------------------------------------//
#include <LiquidCrystal.h>

/* Pin's settings */
//-- LCD Display --
const int RS          = 7; 
const int E           = 8; 
const int D4          = 10; 
const int D5          = 11; 
const int D6          = 12; 
const int D7          = 13; 
//-- RGB LED --
const int redPin      = 9;
const int greenPin    = 5;
const int bluePin     = 6;
//-- LED --
const int ledPin      = 3; 
//-- SWITCH --
const int buttonPin   = 2;
//-- POTENTIOMETER --
const int potPin      = A0;

/* Variables Values */
//--RGB LED --
int redRGB            = 255;
int greenRGB          = 255;
int blueRGB           = 255;
int rgbState          = 1;
//-- LED --
int ledVal            = 255;
int ledState          = 1;
//-- SWITCH --
int buttonState       = HIGH;
int buttonPushCounter = 0;
//-- POTENTIOMETER --
int potValue;
int lastPotValue;
int mapPotValue;
int potState          = 0;
//-- VARIOUS --
String myString;
byte car;
//-- LCD Init. --
LiquidCrystal lcd(RS, E, D4, D5, D6, D7);
//-- POT smoothing settings
const int numReadings = 2;
int readings[numReadings];      // the readings from the analog input
int index = 0;                  // the index of the current reading
int total = 0;                  // the running total

void setup() {
  Serial.begin(9600);
  //-- RGB LED
  pinMode (redPin, OUTPUT);
  pinMode (greenPin, OUTPUT);
  pinMode (bluePin, OUTPUT);
  //-- LED
  pinMode (ledPin, OUTPUT);
  digitalWrite (ledPin, HIGH);
  //-- SWITCH
  pinMode (buttonPin, INPUT);
  //-- POT
  pinMode (potPin, INPUT);
  //-- Print messages to the LCD.
  lcd.begin(16, 2);
  lcd.setCursor(0,0);
  lcd.print("DuinoMultiRemote");
  lcd.setCursor(0,1);
  lcd.print("     Ready!     ");

  for (int thisReading = 0; thisReading < numReadings; thisReading++) readings[thisReading] = 0;          
}

void loop() {
  //-- SWITCH --
  if (digitalRead (buttonPin) == HIGH){
    while (digitalRead (buttonPin) != LOW);
    buttonState = !buttonState;
    switching (buttonState);
    printAll();
  }

  //-- POT --
  if (potState == 1) {
    total = total - readings[index];
    readings[index] = analogRead (potPin);
    delay (2); // delay in between reads for stability
    total= total + readings[index];
    index = index + 1;
    if (index >= numReadings){
      index = 0;
      mapPotValue = total / numReadings;
      potValue = map (mapPotValue, 0, 1023, 0, 100);
    }
    if ( potValue < lastPotValue-1 || potValue > lastPotValue+1) {
      lastPotValue = potValue;
      analogWrite (ledPin, lastPotValue);
      printAll();
    }
  }

  /* SERIAL input datas (S.A.R.A.H's requests) */
  while (Serial.available() > 0) {
    car = Serial.read();
    switch (car) {
      //-- Switch ON/OFF --//
      case 'S':
        Serial.readStringUntil ('\n');
        buttonState = !buttonState;
        switching (buttonState);
      break;
      //-- POT ON/OFF --//
      case 'T':
        Serial.readStringUntil ('\n');
        potState = !potState;
        potState == 0 ? analogWrite (ledPin, ledVal) : analogWrite (ledPin, potValue);
      break;
      //-- RGB LED values --//
      case 'R':
        redRGB   = Serial.parseInt();
        greenRGB = Serial.parseInt();
        blueRGB  = Serial.parseInt();
        rgbState = Serial.parseInt();
        if (Serial.read() == '\n' && rgbState == 1) {
          analogWrite (redPin, redRGB);
          analogWrite (greenPin, greenRGB);
          analogWrite (bluePin, blueRGB);
        } else {
          analogWrite (redPin, 0);
          analogWrite (greenPin, 0);
          analogWrite (bluePin, 0);
        }
      break;
      //-- LED values --//
      case 'L':
        ledVal   = Serial.parseInt();
        ledState = Serial.parseInt();
        Serial.read() == '\n' && ledState == 1 ? analogWrite (ledPin, ledVal) : analogWrite(ledPin, 0);
      break;
      //-- Asking for datas --//
      case '?':
      //-- Unknowns requests --//
      break;
      default:
      return;
    }
    printAll();
  }
}

/* Serial output (print) function */
void printAll () {
char buffer1[16];
char buffer2[16];
  if (buttonState == HIGH ) {
    ledState == 0 ? sprintf (buffer2, "LED:OFF POT:%d",potValue) : sprintf (buffer2, "LED:%d POT:%d%%", ledVal, potValue);
    rgbState == 0 ? sprintf (buffer1, "RGB:OFF") : sprintf (buffer1, "RGB(%d,%d,%d)", redRGB, greenRGB, blueRGB);
  } else {
    sprintf (buffer2,"      OFF       ");
    sprintf (buffer1,"DuinoMultiRemote");
  }
  lcd.clear();
  //lcd.begin(16, 2);
  lcd.setCursor (0,0);
  lcd.print (buffer1);
  lcd.setCursor (0,1);
  lcd.print (buffer2);
  myString  = "S" + String (buttonState);
  myString += "C" + String (buttonPushCounter);
  myString += "T" + String (potState);
  myString += "P" + String (potValue, DEC);
  myString += "X" + String (rgbState);
  myString += "R" + String (redRGB, DEC) + "G" + String (greenRGB, DEC) + "B" + String (blueRGB, DEC);
  myString += "D" + String (ledState);
  myString += "L" + String (ledVal, DEC);
  Serial.println (myString);
}

/* Switch state & settings function */
void switching (int state) {
  if (state == HIGH) {
    // Increase Cycles
    buttonPushCounter++;
    // Set RGB LED values
    analogWrite (redPin, redRGB);
    analogWrite (greenPin, greenRGB);
    analogWrite (bluePin, blueRGB);
    rgbState = 1;
    // Set LED dim ( or POT value)
    analogWrite (ledPin, potState == 0 ? ledVal : map (potValue, 0, 99, 0, 255));
    ledState = 1;
  } else {
    // Disable RGB LED
    analogWrite (redPin, 0);
    analogWrite (greenPin, 0);
    analogWrite (bluePin, 0);
    rgbState=0;
    // Disable LED
    analogWrite (ledPin, 0);
    ledState=0;
    // Disable POT
    potState=0;
  }
}
