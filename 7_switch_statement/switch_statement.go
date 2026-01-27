package main

import (
	"fmt"
	"time"
)

/*
	📌 SWITCH STATEMENT IN GO

	switch is a multi-branch conditional statement
	used to execute different code blocks based
	on different conditions.

	✅ No need of break (auto-break)
	✅ Cleaner than if-else
	✅ Supports expressions & types
*/

func main() {

	// ==============================
	// 1️⃣ Basic switch
	// ==============================
	num := 2
	switch num {
	case 1:
		fmt.Println("One")
	case 2:
		fmt.Println("Two")
	case 3:
		fmt.Println("Three")
	case 4:
		fmt.Println("Four")
	default:
		fmt.Println("Unknown number")
	}

	// ==============================
	// 2️⃣ Multiple values in one case
	// ==============================
	day := 2
	switch day {
	case 1, 3, 5:
		fmt.Println("Odd day")
	case 2, 4, 6:
		fmt.Println("Even day")
	default:
		fmt.Println("Unknown day")
	}

	// ==============================
	// 3️⃣ Expression-based switch
	// ==============================
	number := 15
	switch {
	case number < 0:
		fmt.Println("Negative number")
	case number == 0:
		fmt.Println("Zero")
	case number > 0 && number <= 10:
		fmt.Println("Between 1 and 10")
	case number > 10 && number <= 20:
		fmt.Println("Between 11 and 20")
	default:
		fmt.Println("Greater than 20")
	}

	// ==============================
	// 4️⃣ Weekday / Weekend example
	// ==============================
	switch time.Now().Weekday() {
	case time.Saturday, time.Sunday:
		fmt.Println("It's the weekend 🎉")
	default:
		fmt.Println("It's a weekday 🏢")
	}

	// ==============================
	// 5️⃣ Time-based switch
	// ==============================
	hour := time.Now().Hour()
	switch {
	case hour < 12:
		fmt.Println("Good Morning ☀️")
	case hour >= 12 && hour < 18:
		fmt.Println("Good Afternoon 🌤")
	default:
		fmt.Println("Good Evening 🌙")
	}

	// ==============================
	// 6️⃣ Type switch (VERY IMPORTANT)
	// ==============================
	whoAmI(42)
	whoAmI("Hello Go")
	whoAmI(true)
	whoAmI(3.14)
}

/*
	📌 TYPE SWITCH

	A type switch is used to determine the
	actual type of an interface{} value.
*/
func whoAmI(i interface{}) {
	switch v := i.(type) {
	case int:
		fmt.Printf("I am an int with value %d\n", v)
	case string:
		fmt.Printf("I am a string with value %q\n", v)
	case bool:
		fmt.Printf("I am a boolean with value %t\n", v)
	default:
		fmt.Printf("I am of type %T with value %v\n", v, v)
	}
}

