package main

import (
	"fmt"
	"sync"
	"time"
)

/*
========================================
 GO CHANNELS – COMPLETE GUIDE (WITH DEFINITIONS)
 Interview + Revision + Production Ready
========================================

🔹 What is Channel in Go?
- Channel is a communication mechanism used to send and receive data between goroutines.
- Channel works like a pipe: one goroutine sends data, another receives it.
- Channels are thread-safe by default.

🔹 Why Channels are used?
- To avoid race conditions
- To synchronize goroutines
- To safely share data without using locks

🔹 Important Properties of Channel:
- Channel is typed (chan int, chan string, etc.)
- Channel is blocking by default
- Channel must be created using make()
- Sending to a channel blocks until someone receives
- Receiving blocks until data is available
- Usually sender closes the channel, not receiver
*/

// ----------------------------------------------------
// BASIC CHANNEL (UNBUFFERED)
// ----------------------------------------------------
/*
🔹 Definition: Unbuffered Channel
- An unbuffered channel has no capacity to store data.
- Sender waits until receiver is ready.
- Receiver waits until sender sends data.
- This provides strict synchronization.

🔹 Use Case:
- When you want exact coordination between goroutines
*/
func basicChannelExample() {
	fmt.Println("\n--- Basic Unbuffered Channel ---")

	ch := make(chan string) // create unbuffered channel

	go func() {
		ch <- "Hello from Goroutine" // send data (blocks until received)
	}()

	message := <-ch // receive data
	fmt.Println("Received:", message)
}

// ----------------------------------------------------
// BUFFERED CHANNEL
// ----------------------------------------------------
/*
🔹 Definition: Buffered Channel
- A buffered channel has capacity to store data.
- Sender does NOT block until buffer is full.
- Receiver does NOT block until buffer is empty.

🔹 Syntax:
	make(chan Type, capacity)

🔹 Use Case:
- Improve performance
- Reduce blocking
- When sender and receiver speed is different
*/
func bufferedChannelExample() {
	fmt.Println("\n--- Buffered Channel ---")

	ch := make(chan int, 2) // buffer size = 2

	ch <- 10 // does not block
	ch <- 20 // does not block

	fmt.Println(<-ch)
	fmt.Println(<-ch)
}

// ----------------------------------------------------
// CHANNEL CLOSE & OK PATTERN
// ----------------------------------------------------
/*
🔹 Definition: Closing a Channel
- close(channel) indicates no more data will be sent.
- Only sender should close the channel.
- Receiving from closed channel is allowed.
- Sending to closed channel causes panic.

🔹 OK Pattern:
	value, ok := <-ch
- ok = true  → value received
- ok = false → channel closed
*/
func channelCloseExample() {
	fmt.Println("\n--- Channel Close Example ---")

	ch := make(chan int)

	go func() {
		for i := 1; i <= 3; i++ {
			ch <- i
		}
		close(ch) // sender closes channel
	}()

	for {
		value, ok := <-ch
		if !ok {
			fmt.Println("Channel closed")
			break
		}
		fmt.Println("Received:", value)
	}
}

// ----------------------------------------------------
// RANGE OVER CHANNEL
// ----------------------------------------------------
/*
🔹 Definition: range over channel
- range automatically receives values from channel.
- Loop runs until channel is closed.
- Cleaner and safer than manual ok check.

🔹 Rule:
- Channel MUST be closed, otherwise range blocks forever.
*/
func rangeChannelExample() {
	fmt.Println("\n--- Range Over Channel ---")

	ch := make(chan string)

	go func() {
		ch <- "Go"
		ch <- "Channels"
		ch <- "Are"
		ch <- "Powerful"
		close(ch)
	}()

	for value := range ch {
		fmt.Println(value)
	}
}

// ----------------------------------------------------
// DIRECTIONAL CHANNELS
// ----------------------------------------------------
/*
🔹 Definition: Directional Channels
- chan<- Type  → send-only channel
- <-chan Type  → receive-only channel

🔹 Why use?
- Improves code safety
- Prevents misuse
- Helps compiler catch mistakes
- Preferred in clean architecture & interviews
*/
func sendOnly(ch chan<- string) {
	ch <- "Sent using send-only channel"
}

func receiveOnly(ch <-chan string) {
	fmt.Println("Received:", <-ch)
}

func directionalChannelExample() {
	fmt.Println("\n--- Directional Channel ---")

	ch := make(chan string)

	go sendOnly(ch)
	receiveOnly(ch)
}

// ----------------------------------------------------
// WORKER WITH CHANNEL + WAITGROUP
// ----------------------------------------------------
/*
🔹 Definition: Worker
- Worker is a goroutine that performs a task.

🔹 Definition: WaitGroup
- WaitGroup is used to wait for multiple goroutines to finish.
- wg.Add(n) → number of goroutines
- wg.Done() → one goroutine finished
- wg.Wait() → wait for all to finish

🔹 Why use WaitGroup?
- Prevent main function from exiting early
*/
func worker(id int, ch chan int, wg *sync.WaitGroup) {
	defer wg.Done()
	value := <-ch
	fmt.Printf("Worker %d processed value %d\n", id, value)
}

func workerExample() {
	fmt.Println("\n--- Worker Example ---")

	ch := make(chan int)
	wg := &sync.WaitGroup{}

	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go worker(i, ch, wg)
	}

	for i := 10; i <= 30; i += 10 {
		ch <- i
	}

	wg.Wait()
}

// ----------------------------------------------------
// FAN-OUT / FAN-IN
// ----------------------------------------------------
/*
🔹 Definition: Fan-Out
- One channel sends work to multiple workers.
- Used to parallelize tasks.

🔹 Definition: Fan-In
- Multiple workers send results to a single channel.
- Used to collect results.

🔹 Common Use Cases:
- Background jobs
- API calls
- Data processing pipelines
*/
func fanOutWorker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for job := range jobs {
		time.Sleep(time.Millisecond * 500)
		results <- job * 2
		fmt.Printf("Worker %d processed job %d\n", id, job)
	}
}

func fanInFanOutExample() {
	fmt.Println("\n--- Fan-Out / Fan-In ---")

	jobs := make(chan int)
	results := make(chan int)

	wg := &sync.WaitGroup{}

	for i := 1; i <= 3; i++ {
		wg.Add(1)
		go fanOutWorker(i, jobs, results, wg)
	}

	go func() {
		for i := 1; i <= 5; i++ {
			jobs <- i
		}
		close(jobs)
	}()

	go func() {
		wg.Wait()
		close(results)
	}()

	for result := range results {
		fmt.Println("Result:", result)
	}
}

// ----------------------------------------------------
// SELECT STATEMENT
// ----------------------------------------------------
/*
🔹 Definition: select
- select listens to multiple channel operations.
- Executes the case which is ready first.
- Prevents blocking on a single channel.

🔹 Timeout Pattern:
- time.After() is used to avoid infinite waiting.
- Very important in production systems.
*/
func selectExample() {
	fmt.Println("\n--- Select Statement ---")

	ch1 := make(chan string)
	ch2 := make(chan string)

	go func() {
		time.Sleep(time.Second)
		ch1 <- "Message from channel 1"
	}()

	go func() {
		time.Sleep(time.Second * 2)
		ch2 <- "Message from channel 2"
	}()

	select {
	case msg1 := <-ch1:
		fmt.Println(msg1)
	case msg2 := <-ch2:
		fmt.Println(msg2)
	case <-time.After(time.Second * 3):
		fmt.Println("Timeout")
	}
}

// ----------------------------------------------------
// MAIN FUNCTION
// ----------------------------------------------------
func main() {
	fmt.Println("🚀 Go Channels Complete Guide")

	basicChannelExample()
	bufferedChannelExample()
	channelCloseExample()
	rangeChannelExample()
	directionalChannelExample()
	workerExample()
	fanInFanOutExample()
	selectExample()

	fmt.Println("\n✅ All channel examples executed successfully")
}
