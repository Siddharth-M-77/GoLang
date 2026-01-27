package main

import (
	"fmt"
	"maps"
)

/*
	📌 MAP IN GO (DEFINITION)

	A map is a built-in data type in Go that stores
	data in key–value pairs.

	✔ Keys must be comparable
	✔ Values can be any type
	✔ Maps are reference types
	✔ Maps are unordered
*/

func main() {

	// ==============================
	// 1️⃣ Map Declaration
	// ==============================

	// nil map (zero value)
	var nilMap map[string]int
	fmt.Println("Nil map:", nilMap)

	// empty map using make
	map1 := make(map[string]string)
	fmt.Println("Empty map (make):", map1)

	// ==============================
	// 2️⃣ Map Literal (Initialization)
	// ==============================
	map2 := map[string]int{
		"apple":  5,
		"banana": 10,
	}
	fmt.Println("Map literal:", map2)

	// ==============================
	// 3️⃣ Accessing Values
	// ==============================
	appleCount := map2["apple"]
	fmt.Println("Apple count:", appleCount)

	// ==============================
	// 4️⃣ Checking key existence
	// ==============================
	value, ok := map2["banana"]
	if ok {
		fmt.Println("banana exists with value:", value)
	} else {
		fmt.Println("banana does not exist")
	}

	// ==============================
	// 5️⃣ Modifying map
	// ==============================
	map2["banana"] = 15
	map2["orange"] = 20
	fmt.Println("Modified map:", map2)

	// ==============================
	// 6️⃣ Deleting key
	// ==============================
	delete(map2, "apple")
	fmt.Println("After delete:", map2)

	// ==============================
	// 7️⃣ Iterating over map
	// ==============================
	fmt.Println("Iterating map:")
	for key, value := range map2 {
		fmt.Println(key, "=>", value)
	}

	// ==============================
	// 8️⃣ Comparing maps (Go 1.21+)
	// ==============================
	m1 := map[string]int{
		"a": 1,
		"b": 2,
	}
	m2 := map[string]int{
		"a": 1,
		"b": 2,
	}

	fmt.Println("Are maps equal?", maps.Equal(m1, m2))

	// ==============================
	// 9️⃣ Map reference behavior
	// ==============================
	refMap := m1
	refMap["c"] = 3
	fmt.Println("Original map after change:", m1)

	// ==============================
	// 🔟 Length of map
	// ==============================
	fmt.Println("Length of map:", len(map2))
}
