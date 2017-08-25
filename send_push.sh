curl -X POST \
  -H "X-Parse-Application-Id: 8rRIZo9dfTmTQ76ZZ8WHmoNejWiAEMJ7y7Bq6531ZpOD5mR9NSXrAm9mBF2lb76O" \
  -H "X-Parse-Master-Key: p+PKpCjHQMXPW3X+Bja47GP34g38YH9uXc0t85kFwxBVzFlHZPgrh/XrYlleJdE1DIqvd0mQzL1vZuxTdfxjwor2Lgz1Rz5uan7f8y2alxk+NPWM2Q5gkqOoBkWu2O2bQEN8moTI2qL+WR3h1BbGo/8hKE9pDpfP34wppCrgBlM=" \
  -H "Content-Type: application/json" \
  -d '{
     "priority":"high",
     "where" : {
       "deviceType" : "android"
     },
        "data": {
          "title": "The Shining",
          "alert": "All work and no play makes Jack a dull boy."
        }
      }'\   http://localhost:8080/api/push
