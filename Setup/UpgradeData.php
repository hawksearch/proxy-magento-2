<?php

namespace HawkSearch\Proxy\Setup;

use Magento\Framework\App\Cache\Type\Config;
use Magento\Framework\App\Config\ConfigResource\ConfigInterface;
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
     * @var \Magento\Config\Model\ResourceModel\Config
     */
    private $config;
    /**
     * @var Config
     */
    private $cache;

    /**
     * Init
     *
     * @param CategorySetupFactory $categorySetupFactory
     * @param ConfigInterface $config
     * @param Config $cache
     */
    public function __construct(
                                CategorySetupFactory $categorySetupFactory,
                                ConfigInterface $config,
                                Config $cache)
    {
        $this->categorySetupFactory = $categorySetupFactory;
        $this->config = $config;
        $this->cache = $cache;
    }

    /**
     * {@inheritdoc}
     * @SuppressWarnings(PHPMD.ExcessiveMethodLength)
     */

    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->startSetup();
        if (version_compare($context->getVersion(), '2.1.2', '<')) {
            $this->upgradeTo_212($setup);
        }
        $setup->endSetup();
    }
    private function upgradeTo_212(ModuleDataSetupInterface $setup) {
        $categorySetup = $this->categorySetupFactory->create(['setup' => $setup]);
        $entityTypeId = $categorySetup->getEntityTypeId(\Magento\Catalog\Model\Category::ENTITY);
        $attributeSetId = $categorySetup->getDefaultAttributeSetId($entityTypeId);
        $attribute = $categorySetup->getAttribute(\Magento\Catalog\Model\Category::ENTITY, 'hawk_landing_page');
        if ($attribute) {
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
        }
    }
}