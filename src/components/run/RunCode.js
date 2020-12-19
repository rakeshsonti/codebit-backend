const express = require("express");
const app = express();
const { java, python, c, cpp } = require("compile-run");
const port = 3000;
app.listen(port, () => {
   console.log(`server is listening on port${port} `);
});
app.get("/run", (req, res) => {
   console.log("run end-point is executing.....");
   //  java.runFile("./src/eg1.java", (err, result) => {
   //     console.log(result);
   //     console.log("---------------------");
   //     console.log(err);
   //  });
   const userCode = `
   import java.io.*;
  import java.util.*;
   public class eg1
  {
  public static void main(String args[])
  {
    Scanner sc=new Scanner(System.in);
    int num=sc.nextInt();
    int arr[]=new int[4];
  System.out.println("helllo world");
  System.out.println(num);
  }
  }
  `;
   //  let resultPromise = java.runSource(userCode, { stdin: "3" });
   //  resultPromise
   //     .then((result) => {
   //        console.log("myerror", result.stderr);
   //        console.log("myres", result.stdout);
   //        console.log("memoryusage", result.memoryUsage);
   //        console.log("cpuusage", result.cpuUsage);
   //        console.log("error type", result.errorType);
   //        res.status(200).send(result);
   //     })
   //     .catch((err) => {
   //        res.status(400).send(err);
   //     });
   //--------------------------------------------------------------

   // const sourcecode = `print('hello world'); num1=input();  print(num1);`;
   // const sourcecode = `input1=input();print(input1);`;
   // let resultPromise = python.runSource(sourcecode, { stdin: "3\n2" });
   // let resultPromise = python.runFile("./src/eg1.py", { stdin: "3\n2" });
   // resultPromise
   //    .then((result) => {
   //       console.log("mypython---", result);
   //       res.status(200).send(result);
   //    })
   //    .catch((err) => {
   //       console.log(err);
   //    });
   // const sourcecode = `#include <iostream>
   // using namespace std;

   // int main()
   // {
   //     int firstNumber, secondNumber, sumOfTwoNumbers;

   //     cout << "Enter two integers: ";
   //     cin >> firstNumber >> secondNumber;

   //     // sum of two numbers in stored in variable sumOfTwoNumbers
   //     sumOfTwoNumbers = firstNumber + secondNumber;

   //     // Prints sum
   //     cout << firstNumber << " + " <<  secondNumber << " = " << sumOfTwoNumbers;

   //     return 0;
   // }`;
   // let resultPromise = cpp.runSource(sourcecode, { stdin: "3\n2" });
   // resultPromise
   //    .then((result) => {
   //       console.log("mycpp---", result);
   //       res.status(200).send(result);
   //    })
   //    .catch((err) => {
   //       console.log(err);
   //    });
   const sourcecode = `#include <stdio.h>
int main() {    

    int number1, number2, sum;
    
    printf("Enter two integers: ");
    scanf("%d %d", &number1, &number2);

    // calculating sum
    sum = number1 + number2;      
    
    printf("%d + %d = %d", number1, number2, sum);
    return 0;
}`;
   let resultPromise = c.runSource(sourcecode, { stdin: "3\n2" });
   resultPromise
      .then((result) => {
         console.log("my---", result);
         res.status(200).send(result);
      })
      .catch((err) => {
         console.log(err);
      });
});

const mw1 = (req, res, next) => {
   console.log("request log", req.headers.host, req.url);
   req.ram = "processed by mw1";
   next();
};
const mw2 = (req, res, next) => {
   console.log("request mw2");
   // req.ram = "processed by mw2";
   next();
};
const API_KEY = "abcs";
const AuthMW = (req, res, next) => {
   if (req.headers.authorization === API_KEY) {
      next();
   } else {
      res.sendStatus(401);
   }
};
app.use(mw1);
app.get("/ram", mw2, AuthMW, (req, res) => {
   console.log("my end point", req.ram);
   res.status(200).send(req.ram);
});
