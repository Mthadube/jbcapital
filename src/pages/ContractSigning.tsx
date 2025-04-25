import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ContractData {
  contract: {
    id: string;
    status: string;
    dateCreated: string;
    downloadUrl: string;
    previewUrl: string;
  };
  loan: {
    id: string;
    amount: number;
    term: number;
    interestRate: number;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

const ContractSigning = () => {
  const { contractId } = useParams<{ contractId: string }>();
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const response = await fetch(`/api/contracts/${contractId}/view`);
        if (!response.ok) {
          throw new Error('Failed to fetch contract data');
        }
        const data = await response.json();
        setContractData(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load contract details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [contractId, toast]);

  const handleSign = async () => {
    setSigning(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/sign`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sign contract');
      }

      toast({
        title: "Success",
        description: "Contract signed successfully!",
      });

      // Refresh contract data
      const updatedData = await fetch(`/api/contracts/${contractId}/view`).then(res => res.json());
      setContractData(updatedData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign contract. Please try again.",
      });
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contractData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[90%] max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Contract Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">The requested contract could not be found or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-[90%] max-w-2xl">
        <CardHeader>
          <CardTitle>Contract Review & Signing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Contract Details</h3>
            <p>Contract ID: {contractData.contract.id}</p>
            <p>Status: {contractData.contract.status}</p>
            <p>Created: {new Date(contractData.contract.dateCreated).toLocaleDateString()}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Loan Details</h3>
            <p>Loan Amount: R{contractData.loan.amount.toLocaleString()}</p>
            <p>Term: {contractData.loan.term} months</p>
            <p>Interest Rate: {contractData.loan.interestRate}%</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Borrower Details</h3>
            <p>{contractData.user.firstName} {contractData.user.lastName}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Contract Document</h3>
            {contractData.contract.previewUrl && (
              <div className="aspect-[16/9] w-full">
                <iframe
                  src={contractData.contract.previewUrl}
                  className="h-full w-full rounded border"
                  title="Contract Preview"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              variant="outline"
              onClick={() => window.open(contractData.contract.downloadUrl, '_blank')}
            >
              Download Contract
            </Button>
            <Button
              onClick={handleSign}
              disabled={signing || contractData.contract.status === 'signed'}
            >
              {signing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing...
                </>
              ) : contractData.contract.status === 'signed' ? (
                'Contract Signed'
              ) : (
                'Sign Contract'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractSigning; 