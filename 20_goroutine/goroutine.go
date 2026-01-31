package main

import (
	"fmt"
	"sync"
	"time"
)

/*
================================================================
                GOROUTINES IN GO (START → END)
================================================================

📌 Goroutine kya hoti hai? (Beginner)
Goroutine ek lightweight thread hoti hai
jo background me kaam karti hai.

📌 Advanced / Interview definition:
A goroutine is a lightweight, independently executing function
managed by the Go runtime for concurrent execution.

👉 Goroutine = background me chalne wala kaam
================================================================
*/

/*
====================== WORKER FUNCTION ======================
Ye function normal bhi chal sakta hai
aur goroutine me bhi
*/
func task(name string) {
	for i := 1; i <= 3; i++ {
		fmt.Println(name, "working step", i)
		time.Sleep(500 * time.Millisecond)
	}
}

/*
====================== WORKER WITH WAITGROUP ======================
Ye same kaam hai, bas control ke saath
*/
func taskWithWG(name string, wg *sync.WaitGroup) {

	// jab function khatam ho
	// to waitgroup ko bata do
	defer wg.Done()

	for i := 1; i <= 3; i++ {
		fmt.Println(name, "working step", i)
		time.Sleep(500 * time.Millisecond)
	}
}

func main() {

	/*
		============================================================
		1️⃣ WITHOUT GOROUTINE (SEQUENTIAL EXECUTION)
		============================================================
	*/
	fmt.Println("\n---- WITHOUT GOROUTINE ----")

	task("Task-1")
	task("Task-2")

	/*
		Output:
		Task-1 complete
		Task-2 start
		(Slow, one by one)
	*/

	/*
		============================================================
		2️⃣ WITH GOROUTINE (BUT WITHOUT WAITGROUP ❌)
		============================================================
	*/
	fmt.Println("\n---- WITH GOROUTINE (NO WAITGROUP) ----")

	go task("Goroutine-1")
	go task("Goroutine-2")

	/*
		⚠️ PROBLEM:
		main function jaldi khatam ho sakta hai
		aur goroutines aadhe me band ho jaate hain
	*/

	time.Sleep(1 * time.Second) // ❌ hack (NOT professional)

	/*
		============================================================
		3️⃣ WITH GOROUTINE + WAITGROUP (CORRECT WAY ✅)
		============================================================
	*/

	fmt.Println("\n---- WITH GOROUTINE + WAITGROUP ----")

	// 🧮 WaitGroup = counter
	var wg sync.WaitGroup

	/*
		Manager bol raha hai:
		"2 goroutines ka wait karna hai"
	*/
	wg.Add(2)

	// 👷 Workers start
	go taskWithWG("WG-Goroutine-1", &wg)
	go taskWithWG("WG-Goroutine-2", &wg)

	/*
		Main yahin ruk jaayega
		jab tak counter 0 na ho jaaye
	*/
	wg.Wait()

	fmt.Println("\nMain finished (all goroutines completed)")
}
