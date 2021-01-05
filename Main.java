import java.io.*;
import java.util.*;
class Main
{
    public static boolean countSum(int num)
    {
        int sum=0;
        while(num>0)
        {
            int dgt=num%10;
            sum=sum+dgt;
            num=num/10;
        }
        if(sum%9==0)return true;
        else return false;
    }
    public static void StrangeNumber(int num)
    {
         int count=1;
        for(int i=1;i<1001;i++)
        {
            boolean res=countSum(i);
            if(res)
            {
                count++;
                if(count==num)
                {
                System.out.print(i+" ");
                break;
                }
            }
        }
    }
    public static void main(String str[])
    {
        Scanner sc=new Scanner(System.in);
        int num=sc.nextInt();
       StrangeNumber(num);
    }
}