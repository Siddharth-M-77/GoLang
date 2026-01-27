package main

import (
	"fmt"
	"slices"
)

func main() {

	// ===============================
	// make() with slice
	// ===============================
	var array = make([]int, 0, 10)

	fmt.Println("Array created using make:", array)
	fmt.Println("Length:", len(array))
	fmt.Println("Capacity:", cap(array))

	// append
	array = append(array, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16)
	fmt.Println("After append:", array)
	fmt.Println("Length:", len(array))
	fmt.Println("Capacity:", cap(array))

	// ===============================
	// slice literal
	// ===============================
	slice := []int{}
	fmt.Println("Slice literal:", slice)

	// ===============================
	// copy slice
	// ===============================
	slice1 := make([]int, 2)
	slice1[0] = 1
	slice1[1] = 2

	slice2 := make([]int, len(slice1))
	copy(slice2, slice1)

	fmt.Println("Copy slice:", slice1, slice2)

	// ===============================
	// slicing operations
	// ===============================
	nums := []int{10, 20, 30, 40, 50, 60, 70, 80, 90, 100}
	fmt.Println("Original nums:", nums)

	fmt.Println("nums[2:5]:", nums[2:5])
	fmt.Println("nums[:4]:", nums[:4])
	fmt.Println("nums[5:]:", nums[5:])
	fmt.Println("nums[:]:", nums[:])

	// ===============================
	// built-in functions
	// ===============================
	s := []int{5, 10, 15, 20, 25}
	fmt.Println("\nOriginal Slice:", s)

	fmt.Println("Length:", len(s))
	fmt.Println("Capacity:", cap(s))

	// append
	s = append(s, 30, 35, 40)
	fmt.Println("After append:", s)

	// copy
	s1 := make([]int, 3)
	copy(s1, s)
	fmt.Println("Copied slice:", s1)

	// delete element (index 2)
	s = append(s[:2], s[3:]...)
	fmt.Println("After delete:", s)

	// ===============================
	// sorting
	// ===============================
	s = []int{5, 10, 15, 20, 25}
	fmt.Println("\nBefore sort:", s)
	slices.Sort(s)
	fmt.Println("After sort:", s)

	// ===============================
	// reverse
	// ===============================
	slices.Reverse(s)
	fmt.Println("After reverse:", s)

	// ===============================
	// binary search (slice MUST be sorted)
	// ===============================
	slices.Sort(s)

	index, found := slices.BinarySearch(s, 15)
	fmt.Println("Search 15 -> index:", index, "found:", found)

	index, found = slices.BinarySearch(s, 30)
	fmt.Println("Search 30 -> index:", index, "found:", found)
}
