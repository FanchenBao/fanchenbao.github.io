## 02/17/2019
The two's complement of a negative integer is computed with the dumbest method: produce a binary number in array format for the absolute value of the negative number, and then bit by bit perform the reverse operation, and finally do the plus 1. 

I tried to use a "smarter" method by XORing the abs of a negative number with the maximum number that can be represented by a given number of bits (e.g. 15 for 4 bits, 255 for 8 bits, 65535 for 16 bits, etc.), which practically is using XOR to do the 1's complement, and then add 1 to the resultant number. This would produce a positive number whose binary form is the 2's complement of the original negative number (e.g. (7 ^ 15) + 1 = 9, whose binary form 1001 is the 4-bit 2's complement of -7). However, the problem is XOR seems to work under a 32-bit system. If I do 3 ^ (Math.pow(2, 32) - 1) + 1, the result is -3. Apparently, overflow happens, even though JS seems to be able to handle much bigger integers. I presume that is the limitation of XOR.

Therefore, I have to revert to the dumb method. On a second thought, the dumb method might actually be a good one, because it does not depend on the arithmetic specificities of the environment.

## 02/18/2019
User "readonly" attribute to disable user input in the input tag. As a result, input tag can serve as area for information output.