package main

import "fmt"

/*
	📌 FOR–RANGE IN GO (DEFINITION)

	for–range is a special form of `for` loop
	used to iterate over data structures like:

	✔ array
	✔ slice
	✔ map
	✔ string
	✔ channel

	It returns index/key and value.
*/

func main() {

	// ==============================
	// 1️⃣ Range with slice
	// ==============================
	numbers := []int{10, 20, 30, 40, 50}

	fmt.Println("Range over slice:")
	sum := 0
	for index, value := range numbers {
		fmt.Println("index:", index, "value:", value)
		sum += value
	}
	fmt.Println("Sum:", sum)

	// ==============================
	// 2️⃣ Range with array
	// ==============================
	arr := [3]int{1, 2, 3}
	fmt.Println("\nRange over array:")
	for i, v := range arr {
		fmt.Println("index:", i, "value:", v)
	}

	// ==============================
	// 3️⃣ Ignoring index using _
	// ==============================
	fmt.Println("\nOnly values:")
	for _, v := range numbers {
		fmt.Println("value:", v)
	}

	// ==============================
	// 4️⃣ Range with map
	// ==============================
	fmt.Println("\nRange over map:")
	m := map[string]int{
		"apple":  10,
		"banana": 20,
	}

	for key, value := range m {
		fmt.Println("key:", key, "value:", value)
	}

	// ==============================
	// 5️⃣ Range with string (IMPORTANT)
	// ==============================
	fmt.Println("\nRange over string:")
	str := "GoLang"

	for index, value := range str {
		fmt.Println("index:", index, "value:", string(value))
	}

	/*
		NOTE:
		- value is a rune (Unicode code point)
		- index is byte position, not character index
	*/

	// ==============================
	// 6️⃣ Range with string (Unicode)
	// ==============================
	fmt.Println("\nUnicode string:")
	uni := "Go❤️"

	for i, r := range uni {
		fmt.Printf("index %d -> %c\n", i, r)
	}
}
