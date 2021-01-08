def reverse(s): 
  str = "" 
  for i in s: 
    str = i + str
  return str

str=input();
result=reverse(str);
print(result);