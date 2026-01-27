package main

import "fmt"

/*
	📌 FOR LOOP IN GO

	Go has ONLY ONE loop: `for`
	It replaces while, do-while, foreach.

	✔ simple
	✔ powerful
*/

func main() {

	// ==============================
	// 1️⃣ Classic for loop
	// ==============================
	fmt.Println("Classic for loop:")
	for i := 1; i <= 5; i++ {
		fmt.Println("i =", i)
	}

	// ==============================
	// 2️⃣ Reverse loop
	// ==============================
	fmt.Println("\nReverse loop:")
	for i := 5; i >= 1; i-- {
		fmt.Println("i =", i)
	}

	// ==============================
	// 3️⃣ Infinite loop
	// ==============================
	fmt.Println("\nInfinite loop (break used):")
	count := 1
	for {
		fmt.Println("count =", count)
		if count == 3 {
			break
		}
		count++
	}

	// ==============================
	// 4️⃣ Nested loop (Table)
	// ==============================
	fmt.Println("\nMultiplication Table:")
	for i := 1; i <= 3; i++ {
		for j := 1; j <= 3; j++ {
			fmt.Printf("%d x %d = %d\n", i, j, i*j)
		}
	}

	// ==============================
	// 5️⃣ continue statement
	// ==============================
	fmt.Println("\nContinue example (skip even numbers):")
	for i := 1; i <= 10; i++ {
		if i%2 == 0 {
			continue
		}
		fmt.Println("odd:", i)
	}

	// ==============================
	// 6️⃣ break statement
	// ==============================
	fmt.Println("\nBreak example:")
	for i := 1; i <= 10; i++ {
		if i == 6 {
			fmt.Println("Breaking at", i)
			break
		}
		fmt.Println("i =", i)
	}

	// ==============================
	// 7️⃣ Range loop – slice
	// ==============================
	fmt.Println("\nRange loop with slice:")
	numbers := []int{10, 20, 30, 40, 50}

	for index, value := range numbers {
		fmt.Println("index:", index, "value:", value)
	}

	// ==============================
	// 8️⃣ Range loop – only values
	// ==============================
	fmt.Println("\nOnly values:")
	for _, value := range numbers {
		fmt.Println("value:", value)
	}

	// ==============================
	// 9️⃣ Range loop – map
	// ==============================
	fmt.Println("\nRange loop with map:")
	m := map[string]int{
		"apple":  10,
		"banana": 20,
	}

	for key, value := range m {
		fmt.Println("key:", key, "value:", value)
	}

	// ==============================
	// 🔟 Range loop – string
	// ==============================
	fmt.Println("\nRange loop with string:")
	str := "GoLang"

	for index, ch := range str {
		fmt.Printf("index %d -> %c\n", index, ch)
	}

	// ==============================
	// 1️⃣1️⃣ Labelled break (ADVANCED)
	// ==============================
	fmt.Println("\nLabelled break:")
outer:
	for i := 1; i <= 3; i++ {
		for j := 1; j <= 3; j++ {
			if i == 2 && j == 2 {
				break outer
			}
			fmt.Printf("i=%d j=%d\n", i, j)
		}
	}
}
