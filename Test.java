import java.io.*;
import java.util.*;
class Main{
  public static void main(String args[])throws IOException
  {
   BufferedReader bf=new BufferedReader(new InputStreamReader(System.in));
   String str[]=bf.readLine().split("\\s+");
   int size=Integer.parseInt(str[0]);
   int arr[]=new int[size];
   str=bf.readLine().split("\\s+");
   for(int i=0;i<size;i++)
   {
     arr[i]=Integer.parseInt(str[i]);
   }
   int sum=0;
   for(int i=0;i<size;i++)
   {
     sum=sum+arr[i];
   }
   System.out.println(sum);
  }
}