
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ArrowLeft, Truck, CreditCard, Package, Check } from 'lucide-react';
import { toast } from "sonner";

type DeliveryFormValues = {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

const OffrirLivraison = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { childProfile, theme, customPlace, giftMessage } = location.state || {};
  
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<DeliveryFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'France',
    }
  });

  const handleBackClick = () => {
    navigate(-1);
  };

  const onSubmit = (data: DeliveryFormValues) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Navigate to confirmation page
      navigate('/offrir/confirmation', { 
        state: { 
          childProfile,
          theme,
          customPlace,
          giftMessage,
          delivery: data
        } 
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container px-4 mx-auto max-w-4xl">
        {/* En-tête */}
        <div className="mb-8">
          <button 
            onClick={handleBackClick}
            className="flex items-center text-gray-600 hover:text-mcf-orange mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-mcf-orange-dark mb-2">
            Livraison et paiement 📦
          </h1>
          <p className="text-gray-700">
            Plus qu'une étape avant d'offrir un moment magique à {childProfile?.firstName || "l'enfant"} !
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Formulaire de livraison */}
          <div className="md:col-span-2">
            <Card className="border border-mcf-amber/30 mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2 text-mcf-orange-dark">
                  <Truck className="h-5 w-5" /> Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      rules={{ required: "Le nom est requis" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom et prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      rules={{ 
                        required: "L'email est requis",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email invalide"
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="votre@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      rules={{ required: "L'adresse est requise" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input placeholder="123 rue des Livres" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        rules={{ required: "La ville est requise" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ville</FormLabel>
                            <FormControl>
                              <Input placeholder="Paris" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="postalCode"
                        rules={{ required: "Le code postal est requis" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                              <Input placeholder="75000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="country"
                      rules={{ required: "Le pays est requis" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pays</FormLabel>
                          <FormControl>
                            <Input placeholder="France" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Informations de paiement - Normalement intégré avec Stripe */}
                    <div className="pt-4">
                      <h3 className="text-xl flex items-center gap-2 text-mcf-orange-dark mb-4">
                        <CreditCard className="h-5 w-5" /> Paiement
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Dans une version complète, cette section intégrerait un formulaire de paiement sécurisé via Stripe
                      </p>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 text-gray-500 text-center">
                        Formulaire de paiement Stripe (simulation)
                      </div>
                    </div>
                    
                    <Button 
                      type="submit"
                      className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-5 w-full mt-8 rounded-full shadow-lg hover:shadow-xl transition-all"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Traitement en cours...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Package className="h-5 w-5" /> 
                          Finaliser la commande (18,90€)
                        </span>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Récapitulatif de commande */}
          <div>
            <Card className="border border-mcf-amber/30 mb-6 sticky top-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2 text-mcf-orange-dark">
                  Récapitulatif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold">Livre personnalisé pour :</p>
                    <p className="text-gray-700">{childProfile?.firstName || "L'enfant"}</p>
                    {childProfile?.age && (
                      <p className="text-sm text-gray-500">
                        {childProfile.age === "0-2" ? "0-2 ans" : 
                         childProfile.age === "3-5" ? "3-5 ans" : 
                         childProfile.age === "6-7" ? "6-7 ans" : "8-10 ans"}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="font-semibold">Thème de l'histoire :</p>
                    <p className="text-gray-700">
                      {theme === "fairy-tale" ? "Conte de fées" :
                       theme === "adventure" ? "Aventure" :
                       theme === "travel" ? "Voyage" :
                       theme === "school" ? "École & émotions" :
                       theme === "magic" ? "Magie & fantastique" : "Personnalisé"}
                    </p>
                    {customPlace && (
                      <p className="text-sm text-gray-500">Lieu : {customPlace}</p>
                    )}
                  </div>
                  
                  {giftMessage && (
                    <div>
                      <p className="font-semibold">Message personnel :</p>
                      <p className="text-gray-700 text-sm italic">"{giftMessage.substring(0, 50)}..."</p>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span>Prix du livre :</span>
                    <span className="font-semibold">18,90€</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Livraison :</span>
                    <span className="text-green-600 font-semibold">Gratuite</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total :</span>
                    <span className="text-lg font-bold text-mcf-orange-dark">18,90€</span>
                  </div>
                  
                  <div className="text-center pt-2">
                    <p className="text-sm flex items-center justify-center gap-1 text-green-600">
                      <Check className="h-4 w-4" /> Livraison incluse
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffrirLivraison;
