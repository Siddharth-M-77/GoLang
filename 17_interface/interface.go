package main

import "fmt"

/*
📌 INTERFACE IN GO (BEST INTERVIEW + PROJECT DEFINITION)

An interface in Go is a collection of method signatures
that defines a behavior.
Any type that implements all the methods of an interface
automatically satisfies that interface,
without explicitly declaring it.

🔹 Why interfaces are used?
✔ To achieve loose coupling
✔ To support multiple implementations
✔ To make code scalable and testable
✔ To follow clean architecture principles

👉 In simple words:
Interface decides WHAT to do, not HOW to do.
*/

// PaymentGateway defines payment behavior
type PaymentGateway interface {
	Pay(amount float64) error
}
type Razorpay struct{}

func (r *Razorpay) Pay(amount float64) error {
	fmt.Println("Payment done using Razorpay:", amount)
	return nil
}

type Stripe struct{}

func (s *Stripe) Pay(amount float64) error {
	fmt.Println("Payment done using Stripe:", amount)
	return nil
}

type paypal struct{}

func (p *paypal) Pay(amount float64) error {
	fmt.Println("Paayment done using Paypal:", amount)
	return nil
}

// Boss class
type PaymentService struct {
	gateway PaymentGateway
}

func (p *PaymentService) MakePayment(amount float64) error {
	return p.gateway.Pay(amount)
}

func main() {

	razorpay := &Razorpay{}
	paymentService := PaymentService{
		gateway: razorpay,
	}

	paymentService.MakePayment(100)

	stripe := &Stripe{}
	paymentService.gateway = stripe
	paymentService.MakePayment(250)

	paypal := &paypal{}
	paymentService.gateway = paypal
	paymentService.MakePayment(500)

}
