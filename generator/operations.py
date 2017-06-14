#!/usr/bin/env python
# -*- coding: utf-8 -*-

import math


class Operation(object):

    def __call__(self, x, *args):
        raise NotImplementedError
    
    def generate(self):
        raise NotImplementedError

class OneArgOperation(Operation):

    def generate(self):
        yield ()

class TwoArgsOperation(Operation):

    def __init__(self, y_choices):
        self.y_choices = y_choices

    def generate(self):
        for y in self.y_choices:
            yield (y,)


################################################

class Add(TwoArgsOperation):
    name = '+'
    def __call__(self, x, y):
        return x + y

class Sub(TwoArgsOperation):
    name = '-'
    def __call__(self, x, y):
        return x - y

class RSub(TwoArgsOperation):
    name = 'r-'
    def __call__(self, x, y):
        return y - x

class Mul(TwoArgsOperation):
    name = '*'
    def __call__(self, x, y):
        return x * y

class Div(TwoArgsOperation):
    name = '/'
    def __call__(self, x, y):
        assert y != 0
        return x / y

class RDiv(TwoArgsOperation):
    name = 'r/'
    def __call__(self, x, y):
        assert x != 0
        return y / x

class Square(OneArgOperation):
    name = '^2'
    def __call__(self, x):
        return x * x

class Cube(OneArgOperation):
    name = '^3'
    def __call__(self, x):
        return x * x * x

class TwoPower(OneArgOperation):
    name = '2^'
    def __call__(self, x):
        return 2. ** x

class Sqrt(OneArgOperation):
    name = 'sqrt'
    def __call__(self, x):
        assert x >= 0
        return x ** .5

class Cbrt(OneArgOperation):
    name = 'cbrt'
    def __call__(self, x):
        if x < 0:
            return - (-x) ** (1./3)
        return x ** (1./3)

class Flip(OneArgOperation):
    name = 'flip'
    MAP = {0: 0, 1: 1, 2: 2, 3: 'E', 4: 'h', 5: 5,
           6: 9, 7: 'L', 8: 8, 9: 6}
    def __call__(self, x):
        assert abs(x - int(x)) < 1e-6 and x >= 0
        x = int(x)
        x = ''.join(reversed([str(self.MAP[int(y)]) for y in str(x)]))
        if x.isdigit() and (x == '0' or x[0] != '0'):
            return float(int(x))
        return x

class Factorial(OneArgOperation):
    name = 'fact'
    MAP = {0: 1, 1: 1, 2: 2, 3: 6, 4: 24, 5: 120,
            6: 720, 7: 5040}
    def __call__(self, x):
        assert abs(x - int(x)) < 1e-6
        x = int(x)
        assert x in self.MAP
        return float(self.MAP[x])

class Sin(OneArgOperation):
    name = 'sin'
    def __call__(self, x):
        return math.sin(x * math.pi / 180.)

class Cos(OneArgOperation):
    name = 'cos'
    def __call__(self, x):
        return math.cos(x * math.pi / 180.)

class Tan(OneArgOperation):
    name = 'tan'
    def __call__(self, x):
        return math.tan(x * math.pi / 180.)

class Abs(OneArgOperation):
    name = 'abs'
    def __call__(self, x):
        return abs(x)
