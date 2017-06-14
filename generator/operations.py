#!/usr/bin/env python
# -*- coding: utf-8 -*-


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
        return x + y

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

class Sqrt(OneArgOperation):
    name = 'sqrt'
    def __call__(self, x):
        assert x >= 0
        return x ** .5
