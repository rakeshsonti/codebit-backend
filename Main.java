/*package whatever //do not write package name here */

import java.util.*;
import java.lang.*;
import java.io.*;

class Main {
	public static void main (String[] args) {
	Scanner sc=new Scanner(System.in);
	String s=sc.next();
	s=s.toLowerCase();
	char arr[]=s.toCharArray();
	HashMap<Character,Integer> map=new HashMap<>();
	for(int i=0;i<arr.length;i++)
	{
	    char ch=arr[i];
	    if(map.containsKey(ch))
	    map.put(ch,map.get(ch)+1);
	    else
	    map.put(ch,1);
	}
    for(Map.Entry ent:map.entrySet())
    {
        System.out.print(ent+" ");
    }
	}
}