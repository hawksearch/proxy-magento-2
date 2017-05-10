<?php

namespace HawkSearch\Proxy\Setup;

use Magento\Framework\Module\Setup\Migration;
use Magento\Framework\Setup\InstallDataInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Catalog\Setup\CategorySetupFactory;

class UpgradeData implements \Magento\Framework\Setup\UpgradeDataInterface
{
    /**
     * Category setup factory
     *
     * @var CategorySetupFactory
     */
    private $categorySetupFactory;

    /**
     * Init
     *
     * @param CategorySetupFactory $categorySetupFactory
     */
    public function __construct(CategorySetupFactory $categorySetupFactory) {
        $this->categorySetupFactory = $categorySetupFactory;
    }

    /**
     * {@inheritdoc}
     * @SuppressWarnings(PHPMD.ExcessiveMethodLength)
     */

    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        // TODO: Implement upgrade() method.
        $setup->startSetup();

        /** @var \Magento\Eav\Setup\EavSetup $eavSetup */
        $categorySetup = $this->categorySetupFactory->create(['setup' => $setup]);
        $entityTypeId = $categorySetup->getEntityTypeId(\Magento\Catalog\Model\Category::ENTITY);
        $attributeSetId = $categorySetup->getDefaultAttributeSetId($entityTypeId);
        if (version_compare($context->getVersion(), '2.1.2', '<')) {
            $attribute = $categorySetup->getAttribute(\Magento\Catalog\Model\Category::ENTITY, 'hawk_landing_page');
            if($attribute){
				$idg = $categorySetup->getAttributeGroupId($entityTypeId, $attributeSetId, 'Display Settings');
				$categorySetup->addAttributeToGroup(
				$entityTypeId,
				$attributeSetId,
				$idg,
				'hawk_landing_page',
				46
			);
			$categorySetup->updateAttribute(
				\Magento\Catalog\Model\Category::ENTITY,
				'group',
				'hawk_landing_page',
				'Display Settings'
			);
				
				
			// $attribute->setData('group', 'Display Settings')->save();
			
                
            }
        }
        
        
        $setup->endSetup();
    }
}